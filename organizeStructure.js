const fs = require('fs');
const path = require('path');

const structure = {
  root: ['index.js', '.env', 'package.json', 'package-lock.json', 'testConnection.js'],
  folders: {
    controllers: ['subscriptionController.js', 'userController.js'],
    middleware: ['verifyJWT.js'],
    models: ['subscription.js', 'user.js'],
    routes: ['subscriptionRoutes.js', 'userRoutes.js'],
    utils: ['api.test.js', 'sendReminderEmail.js'],
  },
};

// Root directory
const rootDir = path.resolve('.');

// Check if files are in the correct place
function validateStructure() {
  let isValid = true;

  // Check root files
  structure.root.forEach((file) => {
    if (!fs.existsSync(path.join(rootDir, file))) {
      console.error(`❌ Missing file: ${file} in root directory.`);
      isValid = false;
    }
  });

  // Check folders and their contents
  Object.entries(structure.folders).forEach(([folder, files]) => {
    const folderPath = path.join(rootDir, folder);
    if (!fs.existsSync(folderPath)) {
      console.error(`❌ Missing folder: ${folder}`);
      isValid = false;
    } else {
      files.forEach((file) => {
        if (!fs.existsSync(path.join(folderPath, file))) {
          console.error(`❌ Missing file: ${file} in folder: ${folder}`);
          isValid = false;
        }
      });
    }
  });

  if (isValid) {
    console.log('✅ All files and folders are correctly structured.');
  }
}

// Create missing files and folders (if necessary)
function organizeStructure() {
  // Create folders
  Object.keys(structure.folders).forEach((folder) => {
    const folderPath = path.join(rootDir, folder);
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
      console.log(`📁 Created folder: ${folder}`);
    }

    // Create missing files
    structure.folders[folder].forEach((file) => {
      const filePath = path.join(folderPath, file);
      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, '');
        console.log(`📄 Created file: ${file} in folder: ${folder}`);
      }
    });
  });

  // Create missing root files
  structure.root.forEach((file) => {
    const filePath = path.join(rootDir, file);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, '');
      console.log(`📄 Created file: ${file} in root directory.`);
    }
  });

  console.log('✅ Structure organized successfully.');
}

// Run the validation and organization
validateStructure();
organizeStructure();
