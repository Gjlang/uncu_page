"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Mail, Sparkles } from "lucide-react";

interface PupilProps {
  size?: number;
  maxDistance?: number;
  pupilColor?: string;
  forceLookX?: number;
  forceLookY?: number;
}

const Pupil = ({ 
  size = 12, 
  maxDistance = 5,
  pupilColor = "black",
  forceLookX,
  forceLookY
}: PupilProps) => {
  const [mouseX, setMouseX] = useState<number>(0);
  const [mouseY, setMouseY] = useState<number>(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const pupilRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMouseX(e.clientX);
      setMouseY(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // ✅ Calculate position in useEffect, not during render
  useEffect(() => {
    if (!pupilRef.current) return;

    if (forceLookX !== undefined && forceLookY !== undefined) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPosition({ x: forceLookX, y: forceLookY });
      return;
    }

    const pupil = pupilRef.current.getBoundingClientRect();
    const pupilCenterX = pupil.left + pupil.width / 2;
    const pupilCenterY = pupil.top + pupil.height / 2;

    const deltaX = mouseX - pupilCenterX;
    const deltaY = mouseY - pupilCenterY;
    const distance = Math.min(Math.sqrt(deltaX ** 2 + deltaY ** 2), maxDistance);

    const angle = Math.atan2(deltaY, deltaX);
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPosition({ x, y });
  }, [mouseX, mouseY, maxDistance, forceLookX, forceLookY]);

  return (
    <div
      ref={pupilRef}
      className="rounded-full"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: pupilColor,
        transform: `translate(${position.x}px, ${position.y}px)`,
        transition: 'transform 0.1s ease-out',
      }}
    />
  );
};

interface EyeBallProps {
  size?: number;
  pupilSize?: number;
  maxDistance?: number;
  eyeColor?: string;
  pupilColor?: string;
  isBlinking?: boolean;
  forceLookX?: number;
  forceLookY?: number;
}

const EyeBall = ({ 
  size = 48, 
  pupilSize = 16, 
  maxDistance = 10,
  eyeColor = "white",
  pupilColor = "black",
  isBlinking = false,
  forceLookX,
  forceLookY
}: EyeBallProps) => {
  const [mouseX, setMouseX] = useState<number>(0);
  const [mouseY, setMouseY] = useState<number>(0);
  const [pupilPosition, setPupilPosition] = useState({ x: 0, y: 0 });
  const eyeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMouseX(e.clientX);
      setMouseY(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // ✅ Calculate position in useEffect, not during render
  useEffect(() => {
    if (!eyeRef.current) return;

    if (forceLookX !== undefined && forceLookY !== undefined) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPupilPosition({ x: forceLookX, y: forceLookY });
      return;
    }

    const eye = eyeRef.current.getBoundingClientRect();
    const eyeCenterX = eye.left + eye.width / 2;
    const eyeCenterY = eye.top + eye.height / 2;

    const deltaX = mouseX - eyeCenterX;
    const deltaY = mouseY - eyeCenterY;
    const distance = Math.min(Math.sqrt(deltaX ** 2 + deltaY ** 2), maxDistance);

    const angle = Math.atan2(deltaY, deltaX);
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPupilPosition({ x, y });
  }, [mouseX, mouseY, maxDistance, forceLookX, forceLookY]);

  return (
    <div
      ref={eyeRef}
      className="rounded-full flex items-center justify-center transition-all duration-150"
      style={{
        width: `${size}px`,
        height: isBlinking ? '2px' : `${size}px`,
        backgroundColor: eyeColor,
        overflow: 'hidden',
      }}
    >
      {!isBlinking && (
        <div
          className="rounded-full"
          style={{
            width: `${pupilSize}px`,
            height: `${pupilSize}px`,
            backgroundColor: pupilColor,
            transform: `translate(${pupilPosition.x}px, ${pupilPosition.y}px)`,
            transition: 'transform 0.1s ease-out',
          }}
        />
      )}
    </div>
  );
};

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mouseX, setMouseX] = useState<number>(0);
  const [mouseY, setMouseY] = useState<number>(0);
  const [isPurpleBlinking, setIsPurpleBlinking] = useState(false);
  const [isBlackBlinking, setIsBlackBlinking] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isLookingAtEachOther, setIsLookingAtEachOther] = useState(false);
  const [isPurplePeeking, setIsPurplePeeking] = useState(false);
  
  // ✅ State for character positions (not calculated during render)
  const [purplePos, setPurplePos] = useState({ faceX: 0, faceY: 0, bodySkew: 0 });
  const [blackPos, setBlackPos] = useState({ faceX: 0, faceY: 0, bodySkew: 0 });
  const [yellowPos, setYellowPos] = useState({ faceX: 0, faceY: 0, bodySkew: 0 });
  const [orangePos, setOrangePos] = useState({ faceX: 0, faceY: 0, bodySkew: 0 });
  
  const purpleRef = useRef<HTMLDivElement>(null);
  const blackRef = useRef<HTMLDivElement>(null);
  const yellowRef = useRef<HTMLDivElement>(null);
  const orangeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMouseX(e.clientX);
      setMouseY(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // ✅ Calculate positions in useEffect based on mouse position
  useEffect(() => {
    const calculatePosition = (ref: React.RefObject<HTMLDivElement | null>) => {
      if (!ref.current) return { faceX: 0, faceY: 0, bodySkew: 0 };

      const rect = ref.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 3;

      const deltaX = mouseX - centerX;
      const deltaY = mouseY - centerY;

      const faceX = Math.max(-15, Math.min(15, deltaX / 20));
      const faceY = Math.max(-10, Math.min(10, deltaY / 30));
      const bodySkew = Math.max(-6, Math.min(6, -deltaX / 120));

      return { faceX, faceY, bodySkew };
    };

    setPurplePos(calculatePosition(purpleRef));
    setBlackPos(calculatePosition(blackRef));
    setYellowPos(calculatePosition(yellowRef));
    setOrangePos(calculatePosition(orangeRef));
  }, [mouseX, mouseY]);

  // Blinking effects
  useEffect(() => {
    const getRandomBlinkInterval = () => Math.random() * 4000 + 3000;
    const scheduleBlink = () => {
      const blinkTimeout = setTimeout(() => {
        setIsPurpleBlinking(true);
        setTimeout(() => {
          setIsPurpleBlinking(false);
          scheduleBlink();
        }, 150);
      }, getRandomBlinkInterval());
      return blinkTimeout;
    };
    const timeout = scheduleBlink();
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const getRandomBlinkInterval = () => Math.random() * 4000 + 3000;
    const scheduleBlink = () => {
      const blinkTimeout = setTimeout(() => {
        setIsBlackBlinking(true);
        setTimeout(() => {
          setIsBlackBlinking(false);
          scheduleBlink();
        }, 150);
      }, getRandomBlinkInterval());
      return blinkTimeout;
    };
    const timeout = scheduleBlink();
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (isTyping) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsLookingAtEachOther(true);
      const timer = setTimeout(() => {
        setIsLookingAtEachOther(false);
      }, 800);
      return () => clearTimeout(timer);
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsLookingAtEachOther(false);
    }
  }, [isTyping]);

  useEffect(() => {
    if (password.length > 0 && showPassword) {
      const schedulePeek = () => {
        const peekInterval = setTimeout(() => {
          setIsPurplePeeking(true);
          setTimeout(() => {
            setIsPurplePeeking(false);
          }, 800);
        }, Math.random() * 3000 + 2000);
        return peekInterval;
      };
      const firstPeek = schedulePeek();
      return () => clearTimeout(firstPeek);
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsPurplePeeking(false);
    }
  }, [password, showPassword, isPurplePeeking]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    await new Promise(resolve => setTimeout(resolve, 300));

    if (email === "erik@gmail.com" && password === "1234") {
      alert("Login successful! Welcome, Erik!");
    } else {
      setError("Invalid email or password. Please try again.");
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="relative hidden lg:flex flex-col justify-between bg-gradient-to-br from-purple-600/90 via-purple-600 to-purple-600/80 p-12 text-white">
        <div className="relative z-20">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <div className="size-8 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <Sparkles className="size-4" />
            </div>
            <span>YourBrand</span>
          </div>
        </div>

        <div className="relative z-20 flex items-end justify-center h-[500px]">
          <div className="relative" style={{ width: '550px', height: '400px' }}>
            {/* Midnight Blue abstract character */}
            <div 
              ref={purpleRef}
              className="absolute bottom-0 transition-all duration-700 ease-in-out"
              style={{
                left: '70px',
                width: '180px',
                height: (isTyping || (password.length > 0 && !showPassword)) ? '440px' : '400px',
                background: 'linear-gradient(135deg, #1a1a3e 0%, #0f0f2e 100%)',
                borderRadius: '90px 90px 0 0',
                clipPath: 'polygon(15% 0%, 85% 0%, 100% 100%, 0% 100%)',
                zIndex: 1,
                transform: (password.length > 0 && showPassword)
                  ? `skewX(0deg)`
                  : (isTyping || (password.length > 0 && !showPassword))
                    ? `skewX(${purplePos.bodySkew - 12}deg) translateX(40px)` 
                    : `skewX(${purplePos.bodySkew}deg)`,
                transformOrigin: 'bottom center',
                boxShadow: '0 0 40px rgba(26, 26, 62, 0.6), inset 0 0 60px rgba(79, 70, 229, 0.1)',
              }}
            >
              <div 
                className="absolute flex gap-8 transition-all duration-700 ease-in-out"
                style={{
                  left: (password.length > 0 && showPassword) ? `20px` : isLookingAtEachOther ? `55px` : `${45 + purplePos.faceX}px`,
                  top: (password.length > 0 && showPassword) ? `35px` : isLookingAtEachOther ? `65px` : `${40 + purplePos.faceY}px`,
                }}
              >
                <EyeBall 
                  size={18} 
                  pupilSize={7} 
                  maxDistance={5} 
                  eyeColor="#a5b4fc" 
                  pupilColor="#4f46e5" 
                  isBlinking={isPurpleBlinking}
                  forceLookX={(password.length > 0 && showPassword) ? (isPurplePeeking ? 4 : -4) : isLookingAtEachOther ? 3 : undefined}
                  forceLookY={(password.length > 0 && showPassword) ? (isPurplePeeking ? 5 : -4) : isLookingAtEachOther ? 4 : undefined}
                />
                <EyeBall 
                  size={18} 
                  pupilSize={7} 
                  maxDistance={5} 
                  eyeColor="white" 
                  pupilColor="#2D2D2D" 
                  isBlinking={isPurpleBlinking}
                  forceLookX={(password.length > 0 && showPassword) ? (isPurplePeeking ? 4 : -4) : isLookingAtEachOther ? 3 : undefined}
                  forceLookY={(password.length > 0 && showPassword) ? (isPurplePeeking ? 5 : -4) : isLookingAtEachOther ? 4 : undefined}
                />
              </div>
            </div>

            {/* Dark geometric character */}
            <div 
              ref={blackRef}
              className="absolute bottom-0 transition-all duration-700 ease-in-out"
              style={{
                left: '240px',
                width: '120px',
                height: '310px',
                background: 'linear-gradient(180deg, #1f1f1f 0%, #0a0a0a 100%)',
                borderRadius: '60px 60px 0 0',
                clipPath: 'polygon(20% 0%, 80% 0%, 95% 100%, 5% 100%)',
                zIndex: 2,
                transform: (password.length > 0 && showPassword)
                  ? `skewX(0deg)`
                  : isLookingAtEachOther
                    ? `skewX(${blackPos.bodySkew * 1.5 + 10}deg) translateX(20px)`
                    : (isTyping || (password.length > 0 && !showPassword))
                      ? `skewX(${blackPos.bodySkew * 1.5}deg)` 
                      : `skewX(${blackPos.bodySkew}deg)`,
                transformOrigin: 'bottom center',
                boxShadow: '0 0 30px rgba(0, 0, 0, 0.8), inset 0 0 40px rgba(255, 255, 255, 0.05)',
              }}
            >
              <div 
                className="absolute flex gap-6 transition-all duration-700 ease-in-out"
                style={{
                  left: (password.length > 0 && showPassword) ? `10px` : isLookingAtEachOther ? `32px` : `${26 + blackPos.faceX}px`,
                  top: (password.length > 0 && showPassword) ? `28px` : isLookingAtEachOther ? `12px` : `${32 + blackPos.faceY}px`,
                }}
              >
                <EyeBall 
                  size={16} 
                  pupilSize={6} 
                  maxDistance={4} 
                  eyeColor="#d1d5db" 
                  pupilColor="#374151" 
                  isBlinking={isBlackBlinking}
                  forceLookX={(password.length > 0 && showPassword) ? -4 : isLookingAtEachOther ? 0 : undefined}
                  forceLookY={(password.length > 0 && showPassword) ? -4 : isLookingAtEachOther ? -4 : undefined}
                />
                <EyeBall 
                  size={16} 
                  pupilSize={6} 
                  maxDistance={4} 
                  eyeColor="white" 
                  pupilColor="#2D2D2D" 
                  isBlinking={isBlackBlinking}
                  forceLookX={(password.length > 0 && showPassword) ? -4 : isLookingAtEachOther ? 0 : undefined}
                  forceLookY={(password.length > 0 && showPassword) ? -4 : isLookingAtEachOther ? -4 : undefined}
                />
              </div>
            </div>

            {/* Midnight Purple blob character */}
            <div 
              ref={orangeRef}
              className="absolute bottom-0 transition-all duration-700 ease-in-out"
              style={{
                left: '0px',
                width: '240px',
                height: '200px',
                zIndex: 3,
                background: 'radial-gradient(circle at 30% 30%, #6b21a8 0%, #4c1d95 50%, #2e1065 100%)',
                borderRadius: '50% 50% 0 0 / 100% 100% 0 0',
                transform: (password.length > 0 && showPassword) ? `skewX(0deg)` : `skewX(${orangePos.bodySkew}deg)`,
                transformOrigin: 'bottom center',
                boxShadow: '0 0 50px rgba(107, 33, 168, 0.5), inset 0 -20px 40px rgba(139, 92, 246, 0.3)',
              }}
            >
              <div 
                className="absolute flex gap-8 transition-all duration-200 ease-out"
                style={{
                  left: (password.length > 0 && showPassword) ? `50px` : `${82 + orangePos.faceX}px`,
                  top: (password.length > 0 && showPassword) ? `85px` : `${90 + orangePos.faceY}px`,
                }}
              >
                <Pupil size={12} maxDistance={5} pupilColor="#a855f7" forceLookX={(password.length > 0 && showPassword) ? -5 : undefined} forceLookY={(password.length > 0 && showPassword) ? -4 : undefined} />
                <Pupil size={12} maxDistance={5} pupilColor="#a855f7" forceLookX={(password.length > 0 && showPassword) ? -5 : undefined} forceLookY={(password.length > 0 && showPassword) ? -4 : undefined} />
              </div>
            </div>

            {/* Space Green crystal character */}
            <div 
              ref={yellowRef}
              className="absolute bottom-0 transition-all duration-700 ease-in-out"
              style={{
                left: '310px',
                width: '140px',
                height: '230px',
                background: 'linear-gradient(165deg, #10b981 0%, #059669 40%, #047857 100%)',
                borderRadius: '70px 70px 0 0',
                clipPath: 'polygon(10% 0%, 90% 0%, 100% 85%, 85% 100%, 15% 100%, 0% 85%)',
                zIndex: 4,
                transform: (password.length > 0 && showPassword) ? `skewX(0deg)` : `skewX(${yellowPos.bodySkew}deg)`,
                transformOrigin: 'bottom center',
                boxShadow: '0 0 40px rgba(16, 185, 129, 0.6), inset 0 0 50px rgba(52, 211, 153, 0.2)',
              }}
            >
              <div 
                className="absolute flex gap-6 transition-all duration-200 ease-out"
                style={{
                  left: (password.length > 0 && showPassword) ? `20px` : `${52 + yellowPos.faceX}px`,
                  top: (password.length > 0 && showPassword) ? `35px` : `${40 + yellowPos.faceY}px`,
                }}
              >
                <Pupil size={12} maxDistance={5} pupilColor="#065f46" forceLookX={(password.length > 0 && showPassword) ? -5 : undefined} forceLookY={(password.length > 0 && showPassword) ? -4 : undefined} />
                <Pupil size={12} maxDistance={5} pupilColor="#065f46" forceLookX={(password.length > 0 && showPassword) ? -5 : undefined} forceLookY={(password.length > 0 && showPassword) ? -4 : undefined} />
              </div>
              <div 
                className="absolute w-20 h-[4px] bg-[#2D2D2D] rounded-full transition-all duration-200 ease-out"
                style={{
                  left: (password.length > 0 && showPassword) ? `10px` : `${40 + yellowPos.faceX}px`,
                  top: (password.length > 0 && showPassword) ? `88px` : `${88 + yellowPos.faceY}px`,
                }}
              />
            </div>
          </div>
        </div>

        <div className="relative z-20 flex items-center gap-8 text-sm text-white/60">
          <button onClick={() => {}} className="hover:text-white transition-colors">Privacy Policy</button>
          <button onClick={() => {}} className="hover:text-white transition-colors">Terms of Service</button>
          <button onClick={() => {}} className="hover:text-white transition-colors">Contact</button>
        </div>

        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <div className="absolute top-1/4 right-1/4 size-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 size-96 bg-white/5 rounded-full blur-3xl" />
      </div>

      {/* Right Login Section */}
      <div className="flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-[420px]">
          <div className="lg:hidden flex items-center justify-center gap-2 text-lg font-semibold mb-12">
            <div className="size-8 rounded-lg bg-purple-600/10 flex items-center justify-center">
              <Sparkles className="size-4 text-purple-600" />
            </div>
            <span>YourBrand</span>
          </div>

          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome back!</h1>
            <p className="text-gray-600 text-sm">Please enter your details</p>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="anna@gmail.com"
                value={email}
                autoComplete="off"
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setIsTyping(true)}
                onBlur={() => setIsTyping(false)}
                required
                className="h-12 bg-white border-gray-300 focus:border-purple-600"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 pr-10 bg-white border-gray-300 focus:border-purple-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox id="remember" />
                <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
                  Remember for 30 days
                </Label>
              </div>
              <button onClick={() => {}} className="text-sm text-purple-600 hover:underline font-medium">
                Forgot password?
              </button>
            </div>

            {error && (
              <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
                {error}
              </div>
            )}

            <Button 
              onClick={handleSubmit}
              className="w-full h-12 text-base font-medium bg-purple-600 hover:bg-purple-700" 
              size="lg" 
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Log in"}
            </Button>
          </div>

          <div className="mt-6">
            <Button 
              variant="outline" 
              className="w-full h-12 bg-white border-gray-300 hover:bg-gray-50"
              onClick={() => {}}
            >
              <Mail className="mr-2 size-5" />
              Log in with Google
            </Button>
          </div>

          <div className="text-center text-sm text-gray-600 mt-8">
            Don&apos;t have an account?{" "}
            <button onClick={() => {}} className="text-gray-900 font-medium hover:underline">
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;