

import {useRef, useState} from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import {Form, Button} from 'react-bootstrap';
import { saveAs } from 'file-saver';
import axios from "axios";
function App() {
  const [file, setFile] = useState();
  const [isValid, setValid] = useState(true);
  const appName = useRef();
  const appLogo = useRef();
  const appURL = useRef();

  const onFileChange = (e) => {
    setFile(e.target.files[0]);
  }
  const abc = (_) => {
    axios.get('http://52.29.178.14/api/download', {responseType: 'blob'})
    .then((res) => {
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', '1.zip');
      document.body.appendChild(link);
      link.click();
      link.remove();
    })
  }
  const handleSubmit = (d) => {
    setValid(false);
    const formData = new FormData();
    formData.append('file', file);
    
    axios.post('/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    .then(res => {
      // console.log(res);

      const payload = {
        'name': appName.current.value,
        'logo': appLogo.current.value,
        'url': appURL.current.value,
      };
  
      // axios.interceptors.request.use(config => {
      //   config.timeout = 1000;
      //   return config;
      // });
      
      axios.post('/api', payload, {responseType: 'blob'})
      .then(res => {
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'skeleton.zip');
        document.body.appendChild(link);
        link.click();
        link.remove();
        // console.log(res);
        // setZipURL('http://3.95.255.135:3000/' + res.data.code);
        // // zipLink.current.click();
        setValid(true);
      })
      .catch(e => {
        console.log(e);
      });
    })
    .catch( e => {
      console.log('aaa', e);
    });    

  }
  return (
    <Form noValidate className="center">
      <Form.Group className="mb-3" controlId='appName'>
        <Form.Label>App Name</Form.Label>
        <Form.Control type='input' ref={appName} disabled={!isValid}></Form.Control>
      </Form.Group>
      <Form.Group className="mb-3" controlId='appLogo'>
        <Form.Label>App Logo</Form.Label>
        <Form.Control type='file' disabled={!isValid} filename={file} accept = "image/*" ref={appLogo} onChange={onFileChange}></Form.Control>
      </Form.Group>
      <Form.Group className="mb-3" controlId='appURL'>
        <Form.Label>App URL</Form.Label>
        <Form.Control type='input' disabled={!isValid} ref={appURL}></Form.Control>
      </Form.Group>            
      {/* <Button variant='primary' onClick={handleSubmit}>
        Compile
      </Button> */}
      <Button variant='primary' onClick={handleSubmit} disabled={!isValid}>
        Compile
      </Button>
      <Button variant='primary' onClick={abc} disabled={!isValid}>
        Download
      </Button>

    </Form>

  );  
}

export default App;

