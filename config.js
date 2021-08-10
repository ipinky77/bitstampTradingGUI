const version = "2.0.0"
// Import the filesystem module
const fs = require('fs');
const path = require('path');

async function getProfiles(currentPath) {

    return new Promise((resolve, reject) => {
        fs.readdir(currentPath + "/profiles", (err, files) => {
            if (err)
                console.log(err);
            else {
                // filter only the json files
                const EXTENSION = '.json';
                const targetFiles = files.filter(file => {
                    return path.extname(file).toLowerCase() === EXTENSION;
                });

                // console.log("targetFiles", targetFiles)
                resolve(targetFiles)
            }
        })
    })
}

async function readProfiles(currentPath) {
    const files = await getProfiles(currentPath);
    // console.log("files", files)
    var profiles = {}
    await Promise.all(files.map(async (file) => {
        // console.log(file)
        const obj = require(currentPath + "/profiles/" + file);
        // console.log(obj)
        if (obj.defaultProfile) {
            profiles['defaultProfile'] = obj
        } else {
            profiles[obj.name] = obj
        }
    }));

    return profiles
}


async function getConfiguration(currentPath) {
    var profiles = await readProfiles(currentPath)

    // console.log(profiles)

    var configuration = {}

    var configBot = profiles.configBOT
    configBot.defaultProfile = profiles.defaultProfile
    delete profiles.configBOT
    configuration.bot = configBot

    var configGUI = profiles.configGUI
    configGUI.defaultProfile = profiles.defaultProfile
    delete profiles.configGUI
    configGUI.profiles = profiles
    configuration.gui = configGUI

    return configuration
    // console.log(configuration)
}

module.exports = getConfiguration




