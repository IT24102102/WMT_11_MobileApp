SE2020: Group 11 Assignment Submission

PROJECT NAME
Agricultural Management System (WMT_11_MobileApp)

GROUP DETAILS
Group Number: 11
Module: SE2020

INCLUDED FILES
1. Problem_Statement.pdf
   - Describes the problem domain, objectives, and proposed solution.
2. System_Architecture_Diagram.png (or .pdf)
   - High-level overview of the agricultural system's technical architecture.
3. Database_Schema_Diagram.png (or .pdf)
   - ER diagram showing the relationships between Farmers, Products, ASCs, Loans, etc.
4. API_Endpoint_Table.pdf (Provided as Markdown/PDF)
   - Extensive list of backend routes and user permissions.
5. Team_Responsibility.pdf (Provided as Markdown/PDF)
   - Breakdown of individual roles and contributions towards the system.
6. README.txt
   - This directory index file.

INSTRUCTIONS TO RUN THE PROJECT
[Backend]
1. Navigate to the `Backend` directory.
2. Run `npm install` to install dependencies.
3. Ensure `.env` file is set up with correct MongoDB URI, JWT_SECRET, PORT, etc.
4. Run `npm start` or `node app.js` to start the backend server.

[Mobile App]
1. Navigate to the `MobileApp` directory.
2. Run `npm install`.
3. Start the Expo development server using `npx expo start`.
4. Scan the QR code using Expo Go on your mobile device.

NOTES
- The backend relies on MongoDB. Make sure your database instance is running.
- You can find detailed schemas for crops, machineries, and loans in the `Backend/models` folder.
