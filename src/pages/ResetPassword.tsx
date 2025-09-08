import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { authApi } from '../services/api';
import { useAuth } from '../hooks/useAuth';

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    new_password: '',
    new_password_confirm: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    new: false,
    confirm: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [token, setToken] = useState('');
  const [isValidToken, setIsValidToken] = useState(true);

  // Password validation
  const passwordValidation = {
    minLength: formData.new_password.length >= 8,
    hasUppercase: /[A-Z]/.test(formData.new_password),
    hasLowercase: /[a-z]/.test(formData.new_password),
    hasNumber: /\d/.test(formData.new_password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(formData.new_password)
  };

  const isPasswordValid = Object.values(passwordValidation).every(Boolean);
  const passwordsMatch = formData.new_password === formData.new_password_confirm;

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (!tokenParam) {
      setIsValidToken(false);
    } else {
      setToken(tokenParam);
    }
  }, [searchParams]);

  const togglePasswordVisibility = (field: 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isPasswordValid || !passwordsMatch) {
      setError('Please ensure all password requirements are met and passwords match.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await authApi.resetPassword({
        token,
        new_password: formData.new_password,
        new_password_confirm: formData.new_password_confirm
      });

      // Auto-login after successful password reset
      // Note: This would require the backend to return user credentials or auto-login token
      // For now, we'll redirect to login with a success message
      navigate('/login?reset=success');
    } catch (error: any) {
      let errorMessage = 'Failed to reset password. Please try again.';
      
      if (error.response?.status === 400) {
        if (error.response.data?.token) {
          errorMessage = 'Invalid or expired reset token. Please request a new password reset.';
          setIsValidToken(false);
        } else if (error.response.data?.new_password) {
          errorMessage = error.response.data.new_password[0];
        } else if (error.response.data?.non_field_errors) {
          errorMessage = error.response.data.non_field_errors[0];
        }
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isValidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="relative z-10 w-full max-w-md">
          {/* Logo/Brand section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center overflow-hidden bg-white rounded-xl mb-4 shadow-lg">
              <img src='/bon.png' alt='logo' className='w-full h-16'/>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              Invalid Link
            </h1>
            <p className="text-gray-600 mt-2">This password reset link is invalid or expired</p>
          </div>

          <Card className="bg-white border border-gray-200 shadow-lg">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
                <AlertCircle className="w-6 h-6 text-red-500" />
                Link Expired
              </CardTitle>
              <CardDescription className="text-center text-gray-600">
                The password reset link is no longer valid
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>This link has expired or is invalid</span>
                </div>
              </div>
              
              <div className="text-sm text-gray-600 space-y-2">
                <p>• Password reset links expire after 24 hours</p>
                <p>• Each link can only be used once</p>
                <p>• Request a new password reset if needed</p>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4 pt-6">
              <Link to="/forgot-password" className="w-full">
                <Button className="w-full h-12 bg-black hover:bg-gray-800 text-white font-medium rounded-lg transition-colors">
                  Request New Reset Link
                </Button>
              </Link>
              
              <Link to="/login" className="w-full">
                <Button 
                  variant="outline" 
                  className="w-full h-12 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Sign In
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="relative z-10 w-full max-w-md">
        {/* Logo/Brand section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center overflow-hidden bg-white rounded-xl mb-4 shadow-lg">
            <img src='/bon.png' alt='logo' className='w-full h-16'/>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Reset Password
          </h1>
          <p className="text-gray-600 mt-2">Enter your new password below</p>
        </div>

        <Card className="bg-white border border-gray-200 shadow-lg">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
              <Lock className="w-6 h-6 text-primary" />
              New Password
            </CardTitle>
            <CardDescription className="text-center text-gray-600">
              Choose a strong password for your account
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  {error}
                </div>
              )}

              {/* New Password */}
              <div className="space-y-2">
                <Label htmlFor="new_password">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="new_password"
                    name="new_password"
                    type={showPasswords.new ? 'text' : 'password'}
                    value={formData.new_password}
                    onChange={handleInputChange}
                    placeholder="Enter new password"
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('new')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {formData.new_password && (
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-gray-600 mb-1">Password requirements:</p>
                    <div className="grid grid-cols-1 gap-1 text-xs">
                      <div className={`flex items-center gap-1 ${passwordValidation.minLength ? 'text-green-600' : 'text-red-600'}`}>
                        {passwordValidation.minLength ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                        <span>At least 8 characters</span>
                      </div>
                      <div className={`flex items-center gap-1 ${passwordValidation.hasUppercase ? 'text-green-600' : 'text-red-600'}`}>
                        {passwordValidation.hasUppercase ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                        <span>One uppercase letter</span>
                      </div>
                      <div className={`flex items-center gap-1 ${passwordValidation.hasLowercase ? 'text-green-600' : 'text-red-600'}`}>
                        {passwordValidation.hasLowercase ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                        <span>One lowercase letter</span>
                      </div>
                      <div className={`flex items-center gap-1 ${passwordValidation.hasNumber ? 'text-green-600' : 'text-red-600'}`}>
                        {passwordValidation.hasNumber ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                        <span>One number</span>
                      </div>
                      <div className={`flex items-center gap-1 ${passwordValidation.hasSpecialChar ? 'text-green-600' : 'text-red-600'}`}>
                        {passwordValidation.hasSpecialChar ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                        <span>One special character</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="new_password_confirm">Confirm New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="new_password_confirm"
                    name="new_password_confirm"
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={formData.new_password_confirm}
                    onChange={handleInputChange}
                    placeholder="Confirm new password"
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('confirm')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {formData.new_password_confirm && (
                  <div className="mt-1">
                    {passwordsMatch ? (
                      <div className="flex items-center gap-1 text-green-600 text-xs">
                        <CheckCircle className="h-3 w-3" />
                        <span>Passwords match</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-red-600 text-xs">
                        <AlertCircle className="h-3 w-3" />
                        <span>Passwords don't match</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4 pt-6">
              <Button
                type="submit"
                className="w-full h-12 bg-black hover:bg-gray-800 text-white font-medium rounded-lg transition-colors"
                disabled={isLoading || !isPasswordValid || !passwordsMatch}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Resetting Password...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Reset Password
                  </div>
                )}
              </Button>

              <Link to="/login" className="w-full">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full h-12 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Sign In
                </Button>
              </Link>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;