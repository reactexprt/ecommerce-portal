import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook } from '@fortawesome/free-brands-svg-icons';
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
                    window.FB.getLoginStatus(() => {
                        console.log('FB SDK already initialized');
                        resolve(true);
                    });
                } else {
                    const script = document.createElement('script');
                    script.src = "https://connect.facebook.net/en_US/sdk.js";
                    script.async = true;
                    script.defer = true;
                    script.onload = () => {
                        window.FB.init({
                            appId: process.env.REACT_APP_FB_APP_ID,
                            cookie: true,
                            xfbml: true,
                            version: 'v16.0',
                        });
                        window.FB.getLoginStatus(() => {
                            resolve(true);
                        });
                    };
                    document.body.appendChild(script);
                }
            });
        };

        loadFacebookSDK().then(() => {
            setFbInitialized(true);
        }).catch((error) => {
            console.error('Error loading FB SDK:', error);
        });
    }, []);

    // Define an async function to process Facebook login
    const processFacebookLogin = async (accessToken) => {
        try {
            const backendResponse = await api.post('/auth/facebook', { accessToken });
            const data = backendResponse.data;
            dispatch(login(data.authToken, data.userId));
            navigate('/cart');
        } catch (error) {
            console.error('Facebook Sign-In Error:');
        }
    };

    // Handle Facebook login
    const handleFacebookLogin = () => {
        if (fbInitialized && window.FB) {
            window.FB.login((response) => {
                if (response.authResponse) {
                    processFacebookLogin(response.authResponse.accessToken);
                } else {
                    console.error('User cancelled login or did not fully authorize.');
                }
            }, { scope: 'email' });
        } else {
            console.error('Facebook SDK is not initialized yet.');
        }
    };

    return (
        <div id='fb-login'>
            <button onClick={handleFacebookLogin} className="btn btn-facebook" disabled={!fbInitialized}>
                <FontAwesomeIcon icon={faFacebook} style={{ marginRight: '10px' }} />
                {fbInitialized ? 'Login with Facebook' : 'Loading...'}
            </button>
        </div>
    );
};

export default FacebookSignin;
