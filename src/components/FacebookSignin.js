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

    // Load Facebook SDK and ensure initialization
    useEffect(() => {
        const loadFacebookSDK = () => {
            return new Promise((resolve) => {
                if (window.FB) {
                    console.log('FB SDK already exists, checking initialization status...');
                    window.FB.getLoginStatus(() => {
                        console.log('FB SDK already initialized');
                        resolve(true); // FB is already initialized
                    });
                } else {
                    console.log('Loading FB SDK...');
                    const script = document.createElement('script');
                    script.src = "https://connect.facebook.net/en_US/sdk.js";
                    script.async = true;
                    script.defer = true;
                    script.onload = () => {
                        console.log('FB SDK loaded, initializing...');
                        window.FB.init({
                            appId: process.env.REACT_APP_FACEBOOK_APP_ID,
                            cookie: true,
                            xfbml: true,
                            version: 'v16.0',
                        });
                        window.FB.getLoginStatus(() => {
                            console.log('FB SDK initialized');
                            resolve(true); // FB is now initialized
                        });
                    };
                    document.body.appendChild(script);
                }
            });
        };

        loadFacebookSDK().then(() => {
            setFbInitialized(true); // Only set initialized to true once the SDK is ready
            console.log('FB SDK fully initialized');
        }).catch((error) => {
            console.error('Error loading FB SDK:', error);
        });
    }, []);

    // Handle Facebook login
    const handleFacebookLogin = () => {
        if (fbInitialized && window.FB) {
            console.log('Calling FB.login()...');
            window.FB.login((response) => {
                if (response.authResponse) {
                    console.log('FB login successful');
                    processFacebookLogin(response.authResponse.accessToken);
                } else {
                    console.error('User cancelled login or did not fully authorize.');
                }
            }, { scope: 'email' });
        } else {
            console.error('Facebook SDK is not initialized yet.');
        }
    };

    // Define an async function to process Facebook login
    const processFacebookLogin = async (accessToken) => {
        try {
            console.log('Sending access token to backend...');
            const backendResponse = await api.post('/auth/facebook', { accessToken });
            const data = backendResponse.data;
            console.log('Facebook Sign-In successful, updating state...');
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
