import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema, loginSchema } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import type { InsertUser, LoginCredentials } from "@shared/schema";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const { login, register, user } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect if already logged in
  if (user) {
    setLocation("/");
    return null;
  }

  const loginForm = useForm<LoginCredentials>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onBlur",
  });

  const registerForm = useForm<InsertUser>({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onBlur",
  });

  const onLogin = async (data: LoginCredentials) => {
    try {
      await login(data);
      setLocation("/");
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const onRegister = async (data: InsertUser) => {
    try {
      await register(data);
      setLocation("/");
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <div className="flex-1 flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>{isLogin ? "Login" : "Register"}</CardTitle>
            <CardDescription>
              {isLogin
                ? "Welcome back! Please login to continue."
                : "Create an account to get started."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLogin ? (
              <Form {...loginForm}>
                <form id="login-form" onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="login-email">Email</FormLabel>
                        <FormControl>
                          <Input
                            id="login-email"
                            type="email"
                            placeholder="your@email.com"
                            {...field}
                            aria-describedby="login-email-error"
                          />
                        </FormControl>
                        <FormMessage id="login-email-error" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="login-password">Password</FormLabel>
                        <FormControl>
                          <Input
                            id="login-password"
                            type="password"
                            placeholder="••••••"
                            {...field}
                            aria-describedby="login-password-error"
                          />
                        </FormControl>
                        <FormMessage id="login-password-error" />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loginForm.formState.isSubmitting}
                  >
                    {loginForm.formState.isSubmitting ? "Logging in..." : "Login"}
                  </Button>
                </form>
              </Form>
            ) : (
              <Form {...registerForm}>
                <form id="register-form" onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                  <FormField
                    control={registerForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="register-email">Email</FormLabel>
                        <FormControl>
                          <Input
                            id="register-email"
                            type="email"
                            placeholder="your@email.com"
                            {...field}
                            aria-describedby="register-email-error"
                          />
                        </FormControl>
                        <FormMessage id="register-email-error" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registerForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="register-password">Password</FormLabel>
                        <FormControl>
                          <Input
                            id="register-password"
                            type="password"
                            placeholder="Min. 6 characters"
                            {...field}
                            aria-describedby="register-password-error"
                          />
                        </FormControl>
                        <FormMessage id="register-password-error" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registerForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="register-confirm-password">Confirm Password</FormLabel>
                        <FormControl>
                          <Input
                            id="register-confirm-password"
                            type="password"
                            placeholder="Re-enter password"
                            {...field}
                            aria-describedby="register-confirm-password-error"
                          />
                        </FormControl>
                        <FormMessage id="register-confirm-password-error" />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={registerForm.formState.isSubmitting}
                  >
                    {registerForm.formState.isSubmitting ? "Creating account..." : "Register"}
                  </Button>
                </form>
              </Form>
            )}
            <div className="mt-4 text-center">
              <Button
                variant="link"
                onClick={() => {
                  setIsLogin(!isLogin);
                  // Reset form states when switching
                  if (isLogin) {
                    registerForm.reset();
                  } else {
                    loginForm.reset();
                  }
                }}
                className="text-sm text-muted-foreground"
              >
                {isLogin
                  ? "Don't have an account? Register"
                  : "Already have an account? Login"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="hidden lg:flex flex-1 bg-gradient-to-tr from-primary/20 to-primary/10 items-center justify-center p-8">
        <div className="max-w-md">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Time Tracking Made Simple
          </h1>
          <p className="text-muted-foreground">
            Track your work hours, manage projects, and optimize your earnings with our intuitive time
            tracking solution. Perfect for freelancers and professionals.
          </p>
        </div>
      </div>
    </div>
  );
}