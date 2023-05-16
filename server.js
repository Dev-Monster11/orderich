

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const app = express();
const shell = require('shelljs');
const fs = require('fs');
const archiver = require('archiver');
const path = require('path');

const zipFile = archiver('zip', { zlib: { level: 9 }});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let upload = multer({
    dest: 'uploads/'
});
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "build", "index.html"))
})
app.post('/upload', upload.single("file"), (req, res) => {
    fs.readFile(req.file.path, (err, data) => {
        fs.writeFile("temp.png", data, err => {
            if (err) res.json(err);
        });
    });
    res.json('success');
});
app.post('/', (req, res) => {
    // shell.exec('npm i -g react-native-cli');
    const skeleton = 'react-native init --npm --skip-install --title ' + req.body.name + ' --package-name com.apollo.' + req.body.name + ' ' + req.body.name;
    shell.config.silent=true;
    
    shell.exec(skeleton, function(code, stdout, stderr) {
        
        var command = 'npm i -D @bam.tech/react-native-make';
        // const webviewInstall=  'yarn add react-native-webview';
        shell.cp('App.tsx', req.body.name + '/App.tsx');
        var data = fs.readFileSync(path.join(__dirname, req.body.name, 'App.tsx'), 'utf8');
        var result = data.replace('uri: ', 'uri: "' + req.body.url + '"');
        fs.writeFileSync(path.join(__dirname, req.body.name, 'App.tsx'), result, 'utf8');
        // fs.writeFile(path.join(__dirname, req.body.name, 'App.tsx'), result, 'utf8', (err) =>{
        //     if (err) res.json(err);
        // });
        // fs.readFile(path.join(__dirname, req.body.name, 'App.tsx'), 'utf8', (err, data) => {
        //     if (err){
        //         res.json(err);
        //     }

        //     console.log('App.tsx is ready');
        // });
        
        shell.cd(req.body.name);
        shell.exec(command);
        command = 'npm i react-native-webview';
        shell.exec(command);
        command = 'npm install';
        shell.exec(command);
        command = 'react-native set-icon --platform android --path ../temp.png';
        shell.exec(command);
        command = 'react-native set-icon --platform ios --path ../temp.png';
        shell.exec(command);
        zipFile.on('error', e => {
            res.json(e);
        });
        console.log('Icon Changed');
        const writeStream = fs.createWriteStream(__dirname + '/' + req.body.name + '.zip');
        zipFile.pipe(writeStream);
        // console.log(path.join(__dirname, req.body.name, 'node_modules'));
        fs.rmSync(path.join(__dirname, req.body.name, 'node_modules'), {recursive: true});
        zipFile.directory(path.join(__dirname, req.body.name), false);
        zipFile.finalize();
        console.log('zip file create');
        // // shell.exec('cd ..');
        // shell.cd('..');
        // fs.rmdirSync(path.join(__dirname, req.body.name), {recursive: true});
        // fs.rmSync('temp.png');
        // shell.rm('temp.png');
        const file = `${__dirname}/${req.body.name}.zip`;
        res.download(file);
    });
  
    
});

app.listen(1234, () => console.log('Example app is listening on port 1234.'));