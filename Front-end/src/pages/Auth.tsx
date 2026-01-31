import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  ArrowRight,
  Home,
  Shield
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { HOSTELS, BLOCKS } from '@/utils/constants';

// Validation schemas
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  room: z.string().optional(),
  hostel: z.string().min(1, 'Please select a hostel'),
  block: z.string().optional(),
  role: z.enum(['student', 'warden']).optional().default('student'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
}).refine((data) => {
  // If role is warden, hostel must be explicitly selected
  if (data.role === 'warden' && !data.hostel) {
    return false;
  }
  return true;
}, {
  message: 'Wardens must select their assigned hostel',
  path: ['hostel'],
}).refine((data) => {
  // If role is student, room and block are required
  if (data.role !== 'warden' && (!data.room || data.room.trim() === '')) {
    return false;
  }
  return true;
}, {
  message: 'Room number is required for students',
  path: ['room'],
}).refine((data) => {
  // If role is student, block is required
  if (data.role !== 'warden' && (!data.block || data.block.trim() === '')) {
    return false;
  }
  return true;
}, {
  message: 'Block is required for students',
  path: ['block'],
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

const Auth = () => {
  const navigate = useNavigate();
  const { login, signup, isAuthenticated, user } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if user is already authenticated - redirect based on role
  useEffect(() => {
    if (isAuthenticated && user) {
      const redirectPath = (user.role === 'management' || user.role === 'warden')
        ? '/management'
        : '/dashboard';
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  // Login form
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  // Register form
  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '', room: '', hostel: '', block: '', role: 'student' },
  });

  // Watch role to conditionally show hostel field
  const selectedRole = registerForm.watch('role');

  const handleLogin = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const { error, user } = await login(data.email, data.password);

      if (error || !user) {
        setError('Invalid email or password. Please try again.');
      } else {
        // Redirect based on user role - admins go directly to management
        const redirectPath = (user.role === 'management' || user.role === 'warden')
          ? '/management'
          : '/dashboard';
        navigate(redirectPath, { replace: true });
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await signup({
        name: data.name,
        email: data.email,
        password: data.password,
        room: data.room || '', // Handle optional room
        hostel: data.hostel,
        block: data.block,
        role: data.role,
      });

      if (error) {
        setError('Registration failed. Please try again.');
      } else {
        navigate('/', { replace: true });
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setError(null);
    loginForm.reset();
    registerForm.reset();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-success/5 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-primary shadow-lg">
            <span className="text-2xl font-bold text-primary-foreground">H</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">HostelHub</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Smart Issue Tracking for Hostels
          </p>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-4 text-center">
            <CardTitle className="text-xl">
              {isLogin ? 'Welcome back' : 'Create your account'}
            </CardTitle>
            <CardDescription>
              {isLogin
                ? 'Sign in to continue to HostelHub'
                : 'Get started with HostelHub today'}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 flex items-center gap-2 rounded-lg bg-destructive-muted p-3 text-sm text-destructive"
                >
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {isLogin ? (
                // Login Form
                <motion.form
                  key="login"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={loginForm.handleSubmit(handleLogin)}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="you@university.edu"
                        className={cn(
                          'h-11 pl-10',
                          loginForm.formState.errors.email && 'border-destructive'
                        )}
                        {...loginForm.register('email')}
                      />
                    </div>
                    {loginForm.formState.errors.email && (
                      <p className="text-sm text-destructive">
                        {loginForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        className={cn(
                          'h-11 pl-10 pr-10',
                          loginForm.formState.errors.password && 'border-destructive'
                        )}
                        {...loginForm.register('password')}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {loginForm.formState.errors.password && (
                      <p className="text-sm text-destructive">
                        {loginForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    variant="gradient"
                    size="lg"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        Sign in
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </motion.form>
              ) : (
                // Register Form
                <motion.form
                  key="register"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={registerForm.handleSubmit(handleRegister)}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="register-name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="register-name"
                        type="text"
                        placeholder="John Doe"
                        className={cn(
                          'h-11 pl-10',
                          registerForm.formState.errors.name && 'border-destructive'
                        )}
                        {...registerForm.register('name')}
                      />
                    </div>
                    {registerForm.formState.errors.name && (
                      <p className="text-sm text-destructive">
                        {registerForm.formState.errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="you@university.edu"
                        className={cn(
                          'h-11 pl-10',
                          registerForm.formState.errors.email && 'border-destructive'
                        )}
                        {...registerForm.register('email')}
                      />
                    </div>
                    {registerForm.formState.errors.email && (
                      <p className="text-sm text-destructive">
                        {registerForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Role Selection */}
                  <div className="space-y-2">
                    <Label>I am a</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        type="button"
                        variant={selectedRole === 'student' ? 'default' : 'outline'}
                        className="h-11"
                        onClick={() => registerForm.setValue('role', 'student')}
                      >
                        <User className="mr-2 h-4 w-4" />
                        Student
                      </Button>
                      <Button
                        type="button"
                        variant={selectedRole === 'warden' ? 'default' : 'outline'}
                        className="h-11"
                        onClick={() => registerForm.setValue('role', 'warden')}
                      >
                        <Shield className="mr-2 h-4 w-4" />
                        Warden
                      </Button>
                    </div>
                  </div>

                  {/* Hostel Selection - Show for all */}
                  <div className="space-y-2">
                    <Label htmlFor="register-hostel">Hostel {selectedRole === 'warden' && <span className="text-destructive">*</span>}</Label>
                    <Select
                      onValueChange={(value) => registerForm.setValue('hostel', value)}
                    >
                      <SelectTrigger className={cn(
                        'h-11',
                        registerForm.formState.errors.hostel && 'border-destructive'
                      )}>
                        <SelectValue placeholder="Select hostel" />
                      </SelectTrigger>
                      <SelectContent>
                        {HOSTELS.map((hostel) => (
                          <SelectItem key={hostel.value} value={hostel.label}>
                            {hostel.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {registerForm.formState.errors.hostel && (
                      <p className="text-sm text-destructive">
                        {registerForm.formState.errors.hostel.message}
                      </p>
                    )}
                  </div>

                  {/* Block - Only for Students */}
                  {selectedRole !== 'warden' && (
                    <div className="space-y-2">
                      <Label htmlFor="register-block">Block <span className="text-destructive">*</span></Label>
                      <Select
                        onValueChange={(value) => registerForm.setValue('block', value)}
                      >
                        <SelectTrigger className={cn(
                          'h-11',
                          registerForm.formState.errors.block && 'border-destructive'
                        )}>
                          <SelectValue placeholder="Block" />
                        </SelectTrigger>
                        <SelectContent>
                          {BLOCKS.map((block) => (
                            <SelectItem key={block} value={block}>
                              Block {block}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {registerForm.formState.errors.block && (
                        <p className="text-sm text-destructive">
                          {registerForm.formState.errors.block.message}
                        </p>
                      )}
                    </div>
                  )}



                  {/* Room Number - Only for Students */}
                  {selectedRole !== 'warden' && (
                    <div className="space-y-2">
                      <Label htmlFor="register-room">Room Number</Label>
                      <div className="relative">
                        <Home className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="register-room"
                          type="text"
                          placeholder="e.g., 204"
                          className={cn(
                            'h-11 pl-10',
                            registerForm.formState.errors.room && 'border-destructive'
                          )}
                          {...registerForm.register('room')}
                        />
                      </div>
                      {registerForm.formState.errors.room && (
                        <p className="text-sm text-destructive">
                          {registerForm.formState.errors.room.message}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="register-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="register-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        className={cn(
                          'h-11 pl-10 pr-10',
                          registerForm.formState.errors.password && 'border-destructive'
                        )}
                        {...registerForm.register('password')}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {registerForm.formState.errors.password && (
                      <p className="text-sm text-destructive">
                        {registerForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-confirm">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="register-confirm"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        className={cn(
                          'h-11 pl-10',
                          registerForm.formState.errors.confirmPassword && 'border-destructive'
                        )}
                        {...registerForm.register('confirmPassword')}
                      />
                    </div>
                    {registerForm.formState.errors.confirmPassword && (
                      <p className="text-sm text-destructive">
                        {registerForm.formState.errors.confirmPassword.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    variant="gradient"
                    size="lg"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      <>
                        Create account
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Switch Mode */}
            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">
                {isLogin ? "Don't have an account? " : 'Already have an account? '}
              </span>
              <button
                type="button"
                onClick={switchMode}
                className="font-medium text-primary hover:underline"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </div>

          </CardContent>
        </Card>
      </motion.div>
    </div >
  );
};

export default Auth;
