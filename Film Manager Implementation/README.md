# Film Manager Service - Instructions

## Overview
The Film Manager Service was generated using the [Swagger Codegen](https://github.com/swagger-api/swagger-codegen) project. By leveraging the [OpenAPI Specification](https://github.com/OAI/OpenAPI-Specification) from a remote server, a server stub was easily generated.

---

## Running the Server

To install dependencies and launch the server, execute the following commands from the `Film Manager Implementation` directory:
```bash
cd dsp_exam/Film Manager Implementation
npm start
```

### Accessing the Swagger UI
Once the server is running, you can access the Swagger UI interface by opening the following URL in your browser:
```
http://localhost:3001/docs
```

### Database Visualization
You can view the database using [DB Browser for SQLite](https://sqlitebrowser.org/). Import the database file located at:
```
dsp_exam/Film Manager Implementation/database/databaseV2.db
```

---

## Testing the Application
Use the following credentials to test the application:
- **Username**: `user.dsp@polito.it`
- **Password**: `password`

Other user credentials are availaible in :
```
dsp_exam/Film Manager Implementation/database/passwords_databases.txt
```

---

## Pagination Configuration
To adjust the number of items displayed per page in the pagination mechanism, modify the `OFFSET` variable located in:
```
dsp_exam/Film Manager Implementation/utils/constants.js
```
After making changes to the `OFFSET` value, restart the server for the updates to take effect.

