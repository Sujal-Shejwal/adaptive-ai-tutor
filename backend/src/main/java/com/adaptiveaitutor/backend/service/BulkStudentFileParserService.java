package com.adaptiveaitutor.backend.service;

import com.adaptiveaitutor.backend.dto.BulkInvitationStudent;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class BulkStudentFileParserService {

    private static final Pattern EMAIL_PATTERN = Pattern.compile(
            "[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}",
            Pattern.CASE_INSENSITIVE
    );

    private static final int MAX_STUDENTS = 1000;

    public List<BulkInvitationStudent> parse(MultipartFile file) throws IOException {

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Please upload a non-empty file.");
        }

        String filename = file.getOriginalFilename();

        if (filename == null || filename.isBlank()) {
            throw new IllegalArgumentException("Uploaded file must have a name.");
        }

        String lowerName = filename.toLowerCase(Locale.ROOT);

        List<BulkInvitationStudent> students;

        if (lowerName.endsWith(".xlsx")) {
            students = parseExcel(file);
        } else if (lowerName.endsWith(".pdf")) {
            students = parsePdf(file);
        } else {
            throw new IllegalArgumentException(
                    "Unsupported file type. Please upload an Excel (.xlsx) or PDF file."
            );
        }

        students = cleanAndDeduplicate(students);

        if (students.size() > MAX_STUDENTS) {
            throw new IllegalArgumentException(
                    "The uploaded file contains more than " + MAX_STUDENTS + " students."
            );
        }

        if (students.isEmpty()) {
            throw new IllegalArgumentException(
                    "No valid student Name + Email records were found in the uploaded file."
            );
        }

        return students;
    }

    /**
     * Reads Excel files with columns such as:
     *
     * Name | Email
     *
     * The header names are detected automatically.
     */
    private List<BulkInvitationStudent> parseExcel(MultipartFile file)
            throws IOException {

        List<BulkInvitationStudent> students = new ArrayList<>();

        try (
                InputStream inputStream = file.getInputStream();
                Workbook workbook = new XSSFWorkbook(inputStream)
        ) {

            DataFormatter formatter = new DataFormatter();

            for (int sheetIndex = 0; sheetIndex < workbook.getNumberOfSheets(); sheetIndex++) {

                Sheet sheet = workbook.getSheetAt(sheetIndex);

                int nameColumn = -1;
                int emailColumn = -1;

                Row headerRow = null;

                /*
                 * Search the first few rows for a Name/Email header.
                 */
                int maxHeaderRows = Math.min(sheet.getLastRowNum() + 1, 10);

                for (int rowIndex = 0; rowIndex < maxHeaderRows; rowIndex++) {

                    Row row = sheet.getRow(rowIndex);

                    if (row == null) {
                        continue;
                    }

                    for (Cell cell : row) {

                        String value = formatter.formatCellValue(cell)
                                .trim()
                                .toLowerCase(Locale.ROOT);

                        if (value.equals("name")
                                || value.equals("student name")
                                || value.equals("student_name")
                                || value.equals("full name")
                                || value.equals("fullname")) {

                            nameColumn = cell.getColumnIndex();
                        }

                        if (value.equals("email")
                                || value.equals("email address")
                                || value.equals("email_address")
                                || value.equals("student email")
                                || value.equals("student_email")) {

                            emailColumn = cell.getColumnIndex();
                        }
                    }

                    if (nameColumn != -1 && emailColumn != -1) {
                        headerRow = row;
                        break;
                    }
                }

                /*
                 * If headers were not found, assume:
                 *
                 * Column 0 = Name
                 * Column 1 = Email
                 */
                if (nameColumn == -1 || emailColumn == -1) {

                    nameColumn = 0;
                    emailColumn = 1;

                    headerRow = null;
                }

                int startRow;

                if (headerRow != null) {
                    startRow = headerRow.getRowNum() + 1;
                } else {
                    startRow = 0;
                }

                for (int rowIndex = startRow;
                     rowIndex <= sheet.getLastRowNum();
                     rowIndex++) {

                    Row row = sheet.getRow(rowIndex);

                    if (row == null) {
                        continue;
                    }

                    String name = getCellValue(
                            row.getCell(nameColumn),
                            formatter
                    );

                    String email = getCellValue(
                            row.getCell(emailColumn),
                            formatter
                    );

                    if (name.isBlank() && email.isBlank()) {
                        continue;
                    }

                    /*
                     * Sometimes Excel contains the email but name is blank.
                     * We keep only records that have both values because the
                     * invitation should be personalized.
                     */
                    if (!name.isBlank() && isValidEmail(email)) {

                        students.add(
                                new BulkInvitationStudent(
                                        name.trim(),
                                        email.trim()
                                )
                        );
                    }
                }
            }
        }

        return students;
    }

    /**
     * Reads PDF text and searches each line for an email address.
     *
     * Supported examples:
     *
     * Student One - student1@gmail.com
     * Student One, student1@gmail.com
     * Student One    student1@gmail.com
     */
    private List<BulkInvitationStudent> parsePdf(MultipartFile file)
            throws IOException {

        List<BulkInvitationStudent> students = new ArrayList<>();

        byte[] pdfBytes = file.getBytes();

        try (var document = Loader.loadPDF(pdfBytes)) {

            PDFTextStripper stripper = new PDFTextStripper();

            String text = stripper.getText(document);

            String[] lines = text.split("\\R");

            for (String line : lines) {

                if (line == null) {
                    continue;
                }

                line = line.trim();

                if (line.isBlank()) {
                    continue;
                }

                Matcher matcher = EMAIL_PATTERN.matcher(line);

                if (!matcher.find()) {
                    continue;
                }

                String email = matcher.group().trim();

                String namePart = line.substring(0, matcher.start()).trim();

                /*
                 * Remove common separators before the email.
                 */
                namePart = namePart
                        .replaceAll("[,;:\\-–—|]+$", "")
                        .trim();

                /*
                 * Ignore header lines such as:
                 * Name Email
                 */
                String lowerName = namePart.toLowerCase(Locale.ROOT);

                if (lowerName.equals("name")
                        || lowerName.equals("student name")
                        || lowerName.equals("email")
                        || lowerName.equals("student email")) {

                    continue;
                }

                /*
                 * If the PDF extraction places extra table characters
                 * around the name, clean them.
                 */
                namePart = namePart
                        .replaceAll("\\s+", " ")
                        .trim();

                if (!namePart.isBlank() && isValidEmail(email)) {

                    students.add(
                            new BulkInvitationStudent(
                                    namePart,
                                    email
                            )
                    );
                }
            }
        }

        return students;
    }

    private String getCellValue(
            Cell cell,
            DataFormatter formatter
    ) {

        if (cell == null) {
            return "";
        }

        return formatter.formatCellValue(cell).trim();
    }

    private boolean isValidEmail(String email) {

        if (email == null || email.isBlank()) {
            return false;
        }

        return EMAIL_PATTERN.matcher(email.trim()).matches();
    }

    /**
     * Removes blank records and duplicate email addresses.
     *
     * LinkedHashMap keeps the original order of the uploaded file.
     */
    private List<BulkInvitationStudent> cleanAndDeduplicate(
            List<BulkInvitationStudent> students
    ) {

        Map<String, BulkInvitationStudent> uniqueStudents =
                new LinkedHashMap<>();

        for (BulkInvitationStudent student : students) {

            if (student == null) {
                continue;
            }

            String name = student.getName();
            String email = student.getEmail();

            if (name == null || email == null) {
                continue;
            }

            name = name.trim();
            email = email.trim();

            if (name.isBlank() || !isValidEmail(email)) {
                continue;
            }

            String emailKey = email.toLowerCase(Locale.ROOT);

            if (!uniqueStudents.containsKey(emailKey)) {

                uniqueStudents.put(
                        emailKey,
                        new BulkInvitationStudent(
                                name,
                                email
                        )
                );
            }
        }

        return new ArrayList<>(uniqueStudents.values());
    }
}