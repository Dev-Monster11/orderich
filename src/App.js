

import {useRef, useState} from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import {Form, Button} from 'react-bootstrap';

import axios from "axios";
function App() {
  const [file, setFile] = useState();
  const [zipURL, setZipURL] = useState();
  const [isValid, setValid] = useState(true);
  const appName = useRef();
  const appLogo = useRef();
  const appURL = useRef();
  const zipLink = useRef();

  const onFileChange = (e) => {
    setFile(e.target.files[0]);
  }
  // const onFileUpload = () => {
  //   const formData = new FormData();
  //   formData.append('file', file);
    
  //   axios.post('http://localhost:1234/upload', formData, {
  //     headers: {
  //       'Content-Type': 'multipart/form-data'
  //     }
  //   })
  //   .then(res => {
  //     console.log(res);
  //   })
  //   .catch( e => {
  //     console.log('Error', e);
  //   });
  // }
  const handleSubmit = (d) => {
    setValid(false);
    const formData = new FormData();
    formData.append('file', file);
    
    axios.post('http://127.0.0.1:1234/upload', formData, {
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
      axios.post('http://127.0.0.1:1234', payload)
      .then(res => {
        console.log(res);
        setZipURL('http://3.95.255.135:1234/' + res.data.code);
        // zipLink.current.click();
        setValid(true);
      })
      .catch(e => {
        console.log(e);
      });
    })
    .catch( e => {
      console.log('Error', e);
    });    

  }
  return (
    <Form noValidate className="center">
      <a href={{zipURL}} ref={zipLink}/>
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

    </Form>

  );  
}

export default App;

