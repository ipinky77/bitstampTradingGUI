const version = "2.0.9"
// Import the filesystem module
const fs = require('fs');
const path = require('path');

async function readProfiles(currentPath) {

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

async function getProfiles(currentPath, type) {
    const files = await readProfiles(currentPath);
    // console.log("files", files)
    var profiles = {}
    await Promise.all(files.map(async (file) => {
        // console.log(file)
        const obj = require(currentPath + "/profiles/" + file);
        // console.log(obj)
        if (obj.defaultProfile && obj.type == type) {
            profiles['defaultProfile'] = obj
        } else {
            profiles[obj.name] = obj
        }
    }));

    Object.keys(profiles).forEach(function (key) {
        var t = profiles[key]
        if (t.type != type) {
            delete (profiles[key])
        }
    });

    return profiles
}


module.exports = getProfiles




