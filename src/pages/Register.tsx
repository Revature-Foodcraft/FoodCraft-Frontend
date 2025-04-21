import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../css/Register.module.css';
import foodCraftLogo from '../assets/FoodCraft-Logo.png';
import backgroundVideo from '../assets/backroundRegister.mp4';
import { AuthContext } from '../Components/Contexts';
import { GoogleLogin } from '@react-oauth/google';

const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [error, setError] = useState('');
  const { setLogInStatus } = useContext(AuthContext)
  const nav = useNavigate()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://3.144.40.72:5000/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username,
          password,
          email,
          firstname,
          lastname
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Registration failed');
      try {
        const response = await fetch('http://3.144.40.72:5000/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password }),
        });

        if (response.status == 200) {
          localStorage.setItem('token', (await response.json()).token)
          setLogInStatus(true)
          nav('/')
        } else {
          setError("Failed to register and login to account")
        }

      } catch (err: any) {
        setError(err)
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSuccess = async (credentialResponse: any) => {
    try {
      const response = await fetch('http://3.144.40.72:5000/auth/google', {
        method: 'POST',
        headers: { "Authorization": `Bearer ${credentialResponse.credential}` }
      })

      if (response.status == 200) {
        const data = await response.json()
        localStorage.setItem('token', data.token);
        setLogInStatus(true)
        nav('/')
      } else {
        setError("Failed to Login")
      }
    } catch (error: any) {
      setError(error.message)
    }
  };

  const handleError = () => {
    console.error("Login Failed");
  };

  return (
    <div className="login-container">
      <video autoPlay loop muted className="background-video">
        <source src={backgroundVideo} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <div className="login-box">
        <div>
          <img src={foodCraftLogo} alt="FoodCraft Logo" className="logo" />
        </div>

        <h2 id="loginWords">Register to FoodCraft</h2>

        {error && <p className="error">{error}</p>}

        <form onSubmit={handleRegister}>
          <div>
            <label>Username:</label>
            <input
              type="text"
              name="username"
              required
              className="input-field"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a username"
            />
          </div>
          <div>
            <label>Password:</label>
            <input
              type="password"
              name="password"
              required
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
          </div>
          <div>
            <label>Email:</label>
            <input
              type="email"
              name="email"
              required
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="johndoe@example.com"
            />
          </div>
          <div>
            <label>First Name:</label>
            <input
              type="text"
              name="firstname"
              required
              className="input-field"
              value={firstname}
              onChange={(e) => setFirstname(e.target.value)}
              placeholder="John"
            />
          </div>
          <div>
            <label>Last Name:</label>
            <input
              type="text"
              name="lastname"
              required
              className="input-field"
              value={lastname}
              onChange={(e) => setLastname(e.target.value)}
              placeholder="Doe"
            />
          </div>
          <div className="button-container">
            <button type="submit" className="auth-button">Register</button>
            <Link to="/login" className="auth-button-link">
              <button type="button" className="auth-button">Login</button>
            </Link>
          </div>
        </form>
        <div >
          <p className='mt-3'>or</p>
          <div className='d-flex justify-content-center'>
            <GoogleLogin text="signup_with" onSuccess={handleSuccess} onError={handleError} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
