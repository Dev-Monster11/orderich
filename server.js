

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const app = express();
const shell = require('shelljs');
const fs = require('fs');
const archiver = require('archiver');
const path = require('path');

const zipFile = archiver('zip', { zlib: { level: 9 }});



// app.use(function(req, res, next) {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     next();
//   });
  
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "build")));

app.use(cors({
    origin: '*'
}));

let upload = multer({
    dest: 'uploads/'
});
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "build", "index.html"))
})
app.post('/api/upload', upload.single("file"), (req, res) => {
    console.log(req.file);
    fs.readFile(req.file.path, (err, data) => {
        fs.writeFile("temp.png", data, err => {
            if (err) res.json(err);
        });
    });
    res.json('success');
});
app.post('/api/generate', (req, res) => {
    // shell.exec('npm i -g react-native-cli');
    const skeleton = 'react-native init --npm --skip-install ' + req.body.name;
    shell.config.silent=true;
    
    shell.exec(skeleton, function(code, stdout, stderr) {
        shell.cp('App.tsx', req.body.name + '/App.tsx');
        var data = fs.readFileSync(path.join(__dirname, req.body.name, 'App.tsx'), 'utf8');
        var result = data.replace('uri: ', 'uri: "' + req.body.url + '"');
        fs.writeFileSync(path.join(__dirname, req.body.name, 'App.tsx'), result, 'utf8');
        // console.log('App.tsx copy finished');
        shell.cd(req.body.name);
        shell.mv('package.json', 'backup.json');
        shell.exec('npm init -f');
        shell.exec('npm i -D @bam.tech/react-native-make');
        // console.log(' install done');
        command = 'react-native set-icon --platform android --path ../temp.png';
        shell.exec(command);
        command = 'react-native set-icon --platform ios --path ../temp.png';
        shell.exec(command);
        // console.log('Icon Changed');
        shell.mv('backup.json', 'package.json');
        shell.exec('add-dependencies react-native-webview');
        shell.exec('add-dependencies @bam.tech/react-native-make -D')
        fs.rmSync(path.join(__dirname, req.body.name, 'node_modules'), {recursive: true});        
        zipFile.on('error', e => {
            res.json(e);
        });
        const writeStream = fs.createWriteStream(__dirname + '/' + req.body.name + '.zip');
        zipFile.pipe(writeStream);

        zipFile.directory(path.join(__dirname, req.body.name), false);
        zipFile.finalize()
        .then(() => {
            // console.log('zip file create');

            fs.rmSync(path.join(__dirname, req.body.name), {recursive: true});
            fs.rmSync(`${__dirname}/temp.png`);
            // res.download(path.join(__dirname, `${req.body.name}.zip`));
            res.send('success');
            // res.sendFile(`${req.body.name}.zip`, { root: `${__dirname}`});
        });
    });
  
    
});
app.get('/api/download', (req, res) => {
    res.sendFile(path.join(__dirname, req.query.name + ".zip"));
});
app.listen(3000);