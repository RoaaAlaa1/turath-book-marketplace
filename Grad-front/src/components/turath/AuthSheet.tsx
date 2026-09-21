import { useEffect, useState } from "react";
import { ArrowLeft, KeyRound, LogIn, MailCheck, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTurath } from "@/lib/turath/store";

type AuthMode = "signin" | "signup" | "forgot";
type SignUpStep = 1 | 2 | 3 | 4;
type ForgotStep = 1 | 2 | 3 | 4;

export function AuthSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { activeUser, isAuthenticated, registerUser, signIn, signOut } = useTurath();
  const [mode, setMode] = useState<AuthMode>("signin");
  const [signUpStep, setSignUpStep] = useState<SignUpStep>(1);
  const [forgotStep, setForgotStep] = useState<ForgotStep>(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"customer" | "seller">("customer");
  const [phone, setPhone] = useState("");
  const [genres, setGenres] = useState("");
  const [address, setAddress] = useState("");
  const [storeName, setStoreName] = useState("");
  const [bio, setBio] = useState("");
  const [code, setCode] = useState("");
  const [resetPassword, setResetPassword] = useState("");
  const [resetConfirm, setResetConfirm] = useState("");
  const [remember, setRemember] = useState(true);
  const [seconds, setSeconds] = useState(45);
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [codeError, setCodeError] = useState("");

  useEffect(() => {
    if (!open || seconds <= 0) return;
    const timer = window.setTimeout(() => setSeconds((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [open, seconds]);

  const reset = (nextMode: AuthMode) => {
    setMode(nextMode);
    setSignUpStep(1);
    setForgotStep(1);
    setCode("");
    setError("");
    setEmailError("");
    setPasswordError("");
    setCodeError("");
    setSeconds(45);
  };

  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const passwordStrong = password.length >= 8 && /[a-z]/.test(password) && /[A-Z]/.test(password) && /[^A-Za-z0-9]/.test(password);
  const passwordViolations = password
    ? [
        password.length >= 8 ? "" : "Use at least 8 characters",
        /[a-z]/.test(password) ? "" : "Add at least one lowercase letter",
        /[A-Z]/.test(password) ? "" : "Add at least one uppercase letter",
        /[^A-Za-z0-9]/.test(password) ? "" : "Add at least one special character",
      ].filter(Boolean)
    : [];
  const profileValid = phone.trim().length >= 8 && (role === "customer" ? address.trim().length >= 6 : storeName.trim().length >= 2);

  const handleSheetOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && signUpStep === 3) {
      setMode("signin");
      setSignUpStep(1);
      setCode("");
      setError("");
      setPasswordError("");
      setCodeError("");
      onOpenChange(false);
      window.location.href = "/";
      return;
    }

    onOpenChange(nextOpen);
  };

  const register = async () => {
    const fullName = name.trim();
    const parts = fullName.split(/\s+/).filter(Boolean);
    const firstName = parts[0] ?? "";
    const lastName = parts.slice(1).join(" ") || "User";
    const apiBaseUrl = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");

    try {
      const response = await fetch(`${apiBaseUrl}/api/Auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email: email.trim(),
          password,
          phoneNumber: phone.trim(),
        }),
      });

      const text = await response.text();
      let data: any = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = text;
      }
      if (!response.ok) {
        const errorMessages = Array.isArray(data?.errors)
          ? data.errors.map((item: any) => item?.description ?? item).join(". ")
          : typeof data?.errors === "object"
            ? Object.values(data.errors).flat().join(". ")
            : data?.message || data?.title || (typeof data === "string" && data ? data : "Registration failed.");
        throw new Error(errorMessages);
      }

      if (data?.token) {
        localStorage.setItem("token", data.token);
      }

      if (role === "seller" && data?.token) {
        try {
          await fetch(`${apiBaseUrl}/api/SellerRequests/apply`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${data.token}`,
            },
          });
        } catch {
          // Continue if request creation fails or user can apply from account page
        }
      }

      registerUser({
        name: fullName,
        email: email.trim(),
        role: role === "seller" ? "seller" : "customer",
        phone: phone.trim(),
        genres: genres.split(",").map((item) => item.trim()).filter(Boolean),
        ...(role === "seller"
          ? { sellerState: "pending" as const, storeName: storeName.trim(), bio: bio.trim() }
          : { address: address.trim() }),
      });

      setSignUpStep(4);
      toast.success("Your Turath account is ready");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Registration failed.";
      if (message.toLowerCase().includes("email") || message.toLowerCase().includes("already exists") || message.toLowerCase().includes("already taken")) {
        setEmailError(message);
        setSignUpStep(1);
        setPasswordError("");
      } else {
        setPasswordError(message);
      }
      setCodeError("");
      setError("");
    }
  };

  const submitSignIn = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      return setError("Enter your email and password.");
    }
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail);
    if (!isEmailValid) {
      return setError("Enter a valid email address.");
    }
    setError("");

    const apiBaseUrl = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");

    try {
      const response = await fetch(`${apiBaseUrl}/api/Auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail, password }),
      });

      const text = await response.text();
      let data: any = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = text;
      }

      if (!response.ok) {
        const errorMsg =
          data?.message ||
          data?.title ||
          (typeof data === "string" && data ? data : "Invalid email or password.");
        setError(errorMsg);
        return;
      }

      if (data?.token) {
        localStorage.setItem("token", data.token);
      }

      const isAdminEmail = trimmedEmail.toLowerCase().startsWith("admin@turath.");
      const localUserName =
        data?.firstName && data?.lastName
          ? `${data.firstName} ${data.lastName}`.trim()
          : data?.username || (isAdminEmail ? "Turath Steward" : trimmedEmail.split("@")[0]) || "Turath User";

      signIn(trimmedEmail);

      toast.success(remember ? "Signed in and remembered on this device" : "Signed in");
      onOpenChange(false);
    } catch (err) {
      const localSigned = signIn(trimmedEmail);
      if (localSigned) {
        toast.success(remember ? "Signed in and remembered on this device" : "Signed in");
        onOpenChange(false);
        return;
      }
      setError(err instanceof Error ? err.message : "We could not find an active account with that email.");
    }
  };

  const submitCode = (next: () => void) => {
    if (!code || code.length !== 6 || code !== "123456") {
      return setCodeError("That code is not valid. Use 123456 for this demo.");
    }
    setCodeError("");
    next();
  };

  if (isAuthenticated && mode === "signin") {
    return (
      <Sheet open={open} onOpenChange={handleSheetOpenChange}>
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="font-display tracking-wide">Your Turath account</SheetTitle>
            <SheetDescription>{activeUser.email}</SheetDescription>
          </SheetHeader>
          <div className="space-y-5 px-4">
            <div className="rounded-lg border bg-card p-4">
              <p className="font-serif text-xl">{activeUser.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {activeUser.address ?? activeUser.storeName ?? "Your account is ready for its next chapter."}
              </p>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                onOpenChange(false);
                setEmail("");
                setPassword("");
                signOut();
                toast.success("Signed out");
              }}
            >
              Sign out
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={open} onOpenChange={handleSheetOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="font-display tracking-wide">
            {mode === "signup" ? "Join Turath" : mode === "forgot" ? "Recover your account" : "Welcome back"}
          </SheetTitle>
          <SheetDescription className="font-arabic-display text-base text-primary">
            أَعْطِ الكُتُبَ حَيَاةً جَدِيدَةً
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-4 px-4 pb-8">
          {mode === "signin" && (
            <SignIn
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              remember={remember}
              setRemember={setRemember}
              error={error}
              onSubmit={submitSignIn}
              onForgot={() => reset("forgot")}
              onSignup={() => reset("signup")}
            />
          )}

          {mode === "signup" && (
            <SignUp
              step={signUpStep}
              name={name}
              setName={setName}
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              role={role}
              setRole={setRole}
              phone={phone}
              setPhone={setPhone}
              genres={genres}
              setGenres={setGenres}
              address={address}
              setAddress={setAddress}
              storeName={storeName}
              setStoreName={setStoreName}
              bio={bio}
              setBio={setBio}
              code={code}
              setCode={setCode}
              seconds={seconds}
              error={error}
              emailError={emailError}
              clearEmailError={() => setEmailError("")}
              validEmail={validEmail}
              passwordStrong={passwordStrong}
              profileValid={profileValid}
              passwordViolations={passwordViolations}
              passwordError={passwordError}
              clearPasswordError={() => setPasswordError("")}
              onNext={() => {
                setError("");
                setSignUpStep(2);
              }}
              onProfile={() => {
                setError("");
                setSignUpStep(3);
              }}
              onBackFromVerify={() => {
                setError("");
                setSignUpStep(2);
              }}
              onVerify={() => submitCode(register)}
              onSignin={() => reset("signin")}
              onDone={() => {
                onOpenChange(false);
                reset("signin");
              }}
            />
          )}

          {mode === "forgot" && (
            <Forgot
              step={forgotStep}
              email={email}
              setEmail={setEmail}
              code={code}
              setCode={setCode}
              resetPassword={resetPassword}
              setResetPassword={setResetPassword}
              resetConfirm={resetConfirm}
              setResetConfirm={setResetConfirm}
              seconds={seconds}
              error={error}
              validEmail={validEmail}
              onEmail={() => {
                if (!validEmail) return setError("Enter a valid email address.");
                setError("");
                setForgotStep(2);
              }}
              onVerify={() => submitCode(() => setForgotStep(3))}
              onReset={() => setForgotStep(4)}
              onSignin={() => reset("signin")}
              onBack={() => {
                setError("");
                setForgotStep(1);
              }}
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function SignIn({ email, setEmail, password, setPassword, remember, setRemember, error, onSubmit, onForgot, onSignup }: any) {
  const [submitting, setSubmitting] = useState(false);

  const handleManualSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await onSubmit();
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      void handleManualSubmit();
    }
  };

  return (
    <div className="space-y-4">
      <Field
        label="Email"
        type="email"
        value={email}
        onChange={setEmail}
        autoComplete="off"
        onKeyDown={handleKeyDown}
      />
      <Field
        label="Password"
        type="password"
        value={password}
        onChange={setPassword}
        autoComplete="off"
        onKeyDown={handleKeyDown}
      />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} />
        Remember me
      </label>
      {error && <ErrorText text={error} />}
      <Button
        type="button"
        className="w-full"
        disabled={submitting}
        onClick={(e) => {
          e.preventDefault();
          void handleManualSubmit();
        }}
      >
        <LogIn className="h-4 w-4" /> {submitting ? "Signing in..." : "Sign in"}
      </Button>
      <Button type="button" variant="link" className="w-full" onClick={onForgot}>
        Forgot password?
      </Button>
      <Button type="button" variant="outline" className="w-full" onClick={onSignup}>
        <UserPlus className="h-4 w-4" /> Create an account
      </Button>
    </div>
  );
}

function SignUp(props: any) {
  const passwordIssueText = props.passwordError || (props.password && props.passwordViolations.length ? props.passwordViolations.join(". ") : "");
  const emailInvalidFormat = props.email.trim().length > 0 && !props.validEmail;
  const emailIssueText = props.emailError || (emailInvalidFormat ? "Enter a valid email address (e.g. name@example.com)." : "");

  if (props.step === 1) {
    return (
      <div className="space-y-4">
        <Field label="Name" value={props.name} onChange={props.setName} />
        <div>
          <Field
            label="Email"
            type="email"
            value={props.email}
            onChange={(val) => {
              props.setEmail(val);
              props.clearEmailError?.();
            }}
          />
          {emailIssueText && <div className="mt-1"><ErrorText text={emailIssueText} /></div>}
        </div>
        <div>
          <Field
            label="Password"
            type="password"
            value={props.password}
            onChange={(value) => {
              props.setPassword(value);
              props.clearPasswordError();
            }}
          />
          {passwordIssueText && <div className="mt-1"><ErrorText text={passwordIssueText} /></div>}
        </div>
        <div className="space-y-1.5">
          <Label>Account type</Label>
          <Select value={props.role} onValueChange={props.setRole}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="customer">Customer / قارئ</SelectItem>
              <SelectItem value="seller">Seller / بائع</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          className="w-full"
          disabled={!props.name.trim() || !props.validEmail || !props.passwordStrong}
          onClick={props.onNext}
        >
          Continue
        </Button>
        <Button variant="link" className="w-full" onClick={props.onSignin}>
          Already have an account?
        </Button>
      </div>
    );
  }

  if (props.step === 2) {
    return (
      <div className="space-y-4">
        <Field label="Phone number" value={props.phone} onChange={props.setPhone} />
        <Field label="Preferred genres" value={props.genres} onChange={props.setGenres} placeholder="Fiction, Philosophy" />

        {props.role === "customer" ? (
          <Field label="Default shipping address" value={props.address} onChange={props.setAddress} />
        ) : (
          <>
            <Field label="Store display name" value={props.storeName} onChange={props.setStoreName} />
            <div className="space-y-1.5">
              <Label>Store bio</Label>
              <textarea
                className="border-input bg-transparent w-full rounded-md border px-3 py-2 text-sm"
                value={props.bio}
                onChange={(event) => props.setBio(event.target.value)}
                rows={4}
              />
            </div>
          </>
        )}

        <Button className="w-full" disabled={!props.profileValid} onClick={props.onProfile}>
          Continue to verification
        </Button>
      </div>
    );
  }

  if (props.step === 3) {
    return <CodeStep code={props.code} setCode={props.setCode} seconds={props.seconds} error={props.error} onSubmit={props.onVerify} onBack={props.onBackFromVerify ?? props.onProfile} />;
  }

  return (
    <div className="space-y-4 py-8 text-center">
      <MailCheck className="mx-auto h-12 w-12 text-primary" />
      <h3 className="font-display text-xl">Signed in successfully</h3>
      <p className="text-sm text-muted-foreground">
        Your Turath account is ready. Sellers will see a pending verification notice until approved.
      </p>
      <Button className="w-full" onClick={props.onDone ?? props.onSignin}>
        Done
      </Button>
    </div>
  );
}

function Forgot(props: any) {
  if (props.step === 1) {
    return (
      <div className="space-y-4">
        <Field label="Registered email" type="email" value={props.email} onChange={props.setEmail} />
        {props.error && <ErrorText text={props.error} />}
        <Button className="w-full" onClick={props.onEmail}>
          Send reset code
        </Button>
      </div>
    );
  }

  if (props.step === 2) {
    return <CodeStep code={props.code} setCode={props.setCode} seconds={props.seconds} error={props.error} onSubmit={props.onVerify} onBack={props.onBack} />;
  }

  if (props.step === 3) {
    return (
      <div className="space-y-4">
        <Field label="New password" type="password" value={props.resetPassword} onChange={props.setResetPassword} />
        <p className="text-xs text-muted-foreground">
          Strength: {props.resetPassword.length >= 8 ? "Strong" : "Use at least 8 characters"}
        </p>
        <Field label="Confirm password" type="password" value={props.resetConfirm} onChange={props.setResetConfirm} />
        <Button
          className="w-full"
          disabled={props.resetPassword.length < 8 || props.resetPassword !== props.resetConfirm}
          onClick={props.onReset}
        >
          Create new password
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 py-8 text-center">
      <KeyRound className="mx-auto h-12 w-12 text-primary" />
      <h3 className="font-display text-xl">Password updated</h3>
      <p className="text-sm text-muted-foreground">Your mock reset is complete.</p>
      <Button className="w-full" onClick={props.onSignin}>
        Sign in with new password
      </Button>
    </div>
  );
}

function CodeStep({ code, setCode, seconds, error, onSubmit, onBack }: any) {
  const fieldError = error || (code.length > 0 && (code.length !== 6 || code !== "123456") ? "That code is not valid. Use 123456 for this demo." : "");

  return (
    <div className="space-y-4 text-center">
      <div className="flex items-center justify-between">
        <Button type="button" variant="ghost" size="sm" className="h-8 px-2" onClick={onBack}>
          <ArrowLeft className="mr-1 h-4 w-4" /> Back
        </Button>
        <div className="flex-1" />
      </div>
      <MailCheck className="mx-auto h-10 w-10 text-primary" />
      <p className="text-sm text-muted-foreground">Enter the 6-digit code sent to your email.</p>
      <Input
        className="text-center text-xl tracking-[0.4em]"
        inputMode="numeric"
        maxLength={6}
        value={code}
        onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))}
        placeholder="123456"
      />
      {fieldError && <ErrorText text={fieldError} />}
      <p className="text-xs text-muted-foreground">
        Use 123456 to test · {seconds > 0 ? `Resend code in ${seconds}s` : "You can resend now"}
      </p>
      <Button className="w-full" onClick={onSubmit}>
        Verify code
      </Button>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  autoComplete,
  onKeyDown,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input
        type={type}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        onKeyDown={onKeyDown}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

function ErrorText({ text }: { text: string }) {
  return <p className="text-xs text-destructive">{text}</p>;
}

export function AuthBadge({ onClick }: { onClick: () => void }) {
  const { activeUser, isAuthenticated, role } = useTurath();
  const effectiveRole =
    activeUser?.role === "admin" || role === "admin"
      ? "admin"
      : activeUser?.role === "seller" || activeUser?.sellerState === "approved" || role === "seller"
        ? "seller"
        : "customer";
  const isAdmin = effectiveRole === "admin";
  const isSeller = effectiveRole === "seller";

  return (
    <Button
      variant="ghost"
      className="hidden max-w-[210px] items-center gap-2 px-2 sm:flex"
      onClick={onClick}
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent font-serif text-sm text-accent-foreground">
        {isAuthenticated && activeUser ? activeUser.name.charAt(0).toUpperCase() : "J"}
      </span>
      <div className="flex flex-col text-left leading-tight min-w-0">
        <span className="truncate text-xs font-medium">
          {isAuthenticated && activeUser ? activeUser.name : "Join us"}
        </span>
        {isAuthenticated && (
          <span className="text-[10px] text-muted-foreground">
            {isAdmin ? "Admin Steward" : isSeller ? "Seller" : "Reader"}
          </span>
        )}
      </div>
      {isAuthenticated && isAdmin && (
        <Badge
          variant="secondary"
          className="text-[9px] px-1.5 py-0 h-4 bg-primary/10 text-primary border-primary/20 shrink-0"
        >
          Admin
        </Badge>
      )}
    </Button>
  );
}
