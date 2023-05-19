import {useRef, useState} from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import {Form, Button} from 'react-bootstrap';
import axios from "axios";
import { ThreeCircles } from 'react-loader-spinner';
function App() {
  const [file, setFile] = useState();
  const [isValid, setValid] = useState(true);
  const [isFormValid, setFormValid] = useState(false);
  const [isWorking, setIsWorking] = useState(false);
  const appName = useRef();
  const appLogo = useRef();
  const appURL = useRef();

  const onFileChange = (e) => {
    setFile(e.target.files[0]);
    checkValid();
  }
  const onNameChange = (e) => {
    checkValid()
  }
  const onURLChange = (e) => {
    checkValid()
  }
  const checkValid = () => {
    const str = appURL.current.value;
    var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
    '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
  // return !!pattern.test(str);    
    if (appName.current.value.trim() !== '' && file !== null && !!pattern.test(str)){
      setFormValid(true);
    }else{
      setFormValid(false);
    }
  }
  const handleSubmit = (d) => {
    setValid(false);
    setIsWorking(true);
    const formData = new FormData();
    formData.append('file', file);
    
    axios.post('https://orderichdevbackendservice.orderich.app/appapi/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    .then(res => {
      // console.log(res);

      const payload = {
        'name': appName.current.value,
        'url': appURL.current.value,
      };
      // axios.interceptors.request.use(config => {
      //   config.timeout = 1000;
      //   return config;
      // });
      
      axios.post('https://orderichdevbackendservice.orderich.app/appapi/api/generate', payload)
      .then(res => {
        axios.get('https://orderichdevbackendservice.orderich.app/appapi/api/download', {params: {name: appName.current.value}, responseType: 'blob'})
        .then((res) => {
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
          // setFile('');
          appName.current.value = '';
          appURL.current.value = '';
          appLogo.current.value = null;
          setIsWorking(false);
          setValid(true);
          setFormValid(false)
        });
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
    <>
    <Form noValidate className="center">
      <Form.Group className="mb-3" controlId='appName'>
        <Form.Label>App Name</Form.Label>
        <Form.Control type='input' ref={appName} disabled={!isValid} onChange={onNameChange}></Form.Control>
        <Form.Text className='text-muted'>
          First character must be alphabetic, not numeric or special character
        </Form.Text>
      </Form.Group>
      <Form.Group className="mb-3" controlId='appLogo'>
        <Form.Label>App Logo</Form.Label>
        <Form.Control type='file' disabled={!isValid} filename={file} accept = "image/*" ref={appLogo} onChange={onFileChange}></Form.Control>
        <Form.Text className='text-muted'>
          Must be Square, larger than 1024*1024 only support PNG or JPG
        </Form.Text>        
      </Form.Group>
      <Form.Group className="mb-3" controlId='appURL'>
        <Form.Label>App URL</Form.Label>
        <Form.Control type='input' disabled={!isValid} ref={appURL} onChange={onURLChange}></Form.Control>
      </Form.Group>
      <Button variant='primary' onClick={handleSubmit} disabled={!isFormValid}>
        Compile
      </Button>

    </Form>
    {isWorking ? 
      <div style={{  position:'absolute', top:0, left:0, width:'100%', height:'100%', zIndex: 9999}}>
      <ThreeCircles
        height="100"
        width="100"
        color="#4fa94d"
        wrapperStyle={{marginLeft:'50%', marginTop:'30%'}}
        wrapperClass=""
        ariaLabel="three-circles-rotating"
        outerCircleColor=""
        innerCircleColor=""
        middleCircleColor=""
      /></div> : <></>
    }
    </>

  );  
}

export default App;