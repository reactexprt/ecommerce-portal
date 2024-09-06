import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login } from '../redux/actions/authActions';
import api from '../services/api';
import '../pages/login/Login.css';

const FacebookSignin = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [fbInitialized, setFbInitialized] = useState(false);

    // Load Facebook SDK and wait for initialization
    useEffect(() => {
        const loadFacebookSDK = () => {
            console.log(window.FB, 'FVB');
            if (!window.FB) {
                // Load the Facebook SDK script
                const script = document.createElement('script');
                script.src = "https://connect.facebook.net/en_US/sdk.js";
                script.async = true;
                script.defer = true;
                script.onload = () => {
                    console.log('initing');
                    window.FB.init({
                        appId: process.env.REACT_APP_FACEBOOK_APP_ID,
                        cookie: true,
                        xfbml: true,
                        version: 'v16.0',
                    });
                    setFbInitialized(true); // Mark SDK as initialized
                };
                document.body.appendChild(script);
            } else {
                // FB already initialized
                setFbInitialized(true);
            }
        };

        loadFacebookSDK();
    }, []);

    // Handle Facebook login
    const handleFacebookLogin = () => {
        if (fbInitialized && window.FB) {
            window.FB.login((response) => {
                if (response.authResponse) {
                    // Call the async function here
                    processFacebookLogin(response.authResponse.accessToken);
                } else {
                    console.error('User cancelled login or did not fully authorize.');
                }
            }, { scope: 'email' });
        } else {
            console.error('Facebook SDK not initialized yet.');
        }
    };

    // Define an async function to process Facebook login
    const processFacebookLogin = async (accessToken) => {
        try {
            const backendResponse = await api.post('/auth/facebook', { accessToken });
            const data = backendResponse.data;
            dispatch(login(data.authToken, data.userId));
            navigate('/cart');
        } catch (error) {
            console.error('Facebook Sign-In Error:', error);
        }
    };

    return (
        <div>
            <button onClick={handleFacebookLogin} className="btn btn-facebook" disabled={!fbInitialized}>
                {fbInitialized ? 'Login with Facebook' : 'Loading...'}
            </button>
        </div>
    );
};

export default FacebookSignin;
