const fs = require('fs');
const path = 'server/prisma/schema.prisma';
const content = fs.readFileSync(path, 'utf8');

const cleanHeader = `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

`;

const enumsIndex = content.indexOf('// Enums');
if (enumsIndex !== -1) {
    const restOfFile = content.substring(enumsIndex);
    fs.writeFileSync(path, cleanHeader + restOfFile, 'utf8');
    console.log('Fixed schema duplicates successfully');
} else {
    console.log('Could not find // Enums block to perform fix');
}
