

const express = require('express');
const cors = require('cors');
const app = express();
const shell = require('shelljs');
const fs = require('fs');
const archiver = require('archiver');
const path = require('path');
const formidable = require('formidable');
const zipFile = archiver('zip', { zlib: { level: 9 }});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(cors({
    origin: '*'
}));

app.use(express.static(path.join(__dirname, "build")));
app.get('/appmanager', (req, res) => {
    res.sendFile(path.join(__dirname, "build", "index.html"));
})
app.post('/appmanager/api/upload', (req, res) => {
    const form = new formidable.IncomingForm();
    form.uploadDir = path.join(__dirname, 'uploads');
    form.parse(req);
    form.on('file', (err, file) => {
        res.send(file.newFilename);
    });
});
app.post('/appmanager/api/generate', (req, res) => {

    const skeleton = 'react-native init --npm --skip-install ' + req.body.name;
    shell.config.silent=true;
    shell.exec(skeleton, function(code, stdout, stderr) {
        shell.cp('App.tsx', req.body.name + '/App.tsx');
        var data = fs.readFileSync(path.join(__dirname, req.body.name, 'App.tsx'), 'utf8');
        var result = data.replace('uri: ', 'uri: "' + req.body.url + '"');
        fs.writeFileSync(path.join(__dirname, req.body.name, 'App.tsx'), result, 'utf8');
        console.log('App.tsx copy finished');
        shell.cd(req.body.name);
        shell.mv('package.json', 'backup.json');
        shell.exec('npm init -f');
        shell.exec('npm i -D @bam.tech/react-native-make');
        console.log(' install done');
        command = 'react-native set-icon --platform android --path ../uploads/' + req.body.logo;
        shell.exec(command);
        command = 'react-native set-icon --platform ios --path ../uploads' + req.body.logo;
        shell.exec(command);
        console.log('Icon Changed');
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
            console.log('zip file create');

            fs.rmSync(path.join(__dirname, req.body.name), {recursive: true});
            fs.rmSync(`${__dirname}/temp.png`);
            // res.download(path.join(__dirname, `${req.body.name}.zip`));
            // res.send('success');
            res.sendFile(path.join(__dirname, req.body.name + ".zip"));
        });
    });
  
    
});
app.get('/appmanager/api/download', (req, res) => {
    res.sendFile(path.join(__dirname, req.query.name + ".zip"));
});
app.listen(30001);