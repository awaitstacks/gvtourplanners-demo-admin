import React, { useContext, useState, useEffect } from "react";
import { TourAdminContext } from "../context/TourAdminContext.jsx";
import { TourContext } from "../context/TourContext.jsx";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import NewLogo from "../assets/newlogo.png";

const TourLogin = () => {
  const [state, setState] = useState("Admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ email: "", password: "", server: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { setAToken, backendUrl } = useContext(TourAdminContext);
  const { setttoken } = useContext(TourContext);
  const navigate = useNavigate();

  useEffect(() => {
    return () => toast.dismiss();
  }, []);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateFields = () => {
    const newErrors = { email: "", password: "", server: "" };
    let isValid = true;

    if (!email) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Invalid email format";
      isValid = false;
    }

    if (!password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    if (!validateFields()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setIsSubmitting(true);
    try {
      if (state === "Admin") {
        const { data } = await axios.post(backendUrl + "/api/touradmin/login", {
          email,
          password,
        });
        if (data.success) {
          localStorage.setItem("aToken", data.token);
          setAToken(data.token);
          toast.success("Admin login successful!");
          navigate("/admin-dashboard");
        } else {
          setErrors((prev) => ({ ...prev, server: data.message }));
          toast.error(data.message);
        }
      } else {
        const { data } = await axios.post(backendUrl + "/api/tour/login", {
          email,
          password,
        });
        if (data.success) {
          localStorage.setItem("ttoken", data.token);
          setttoken(data.token);
          toast.success("Tour Admin login successful!");
          navigate("/task-dashboard");
        } else {
          setErrors((prev) => ({ ...prev, server: data.message }));
          toast.error(data.message);
        }
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Login failed. Please try again.";
      setErrors((prev) => ({ ...prev, server: errorMessage }));
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* PREMIUM ANIMATED BACKGROUND */}
      <div className="fixed inset-0 -z-10 overflow-hidden bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100">
        {/* FLOATING ICONS + FLYING AIRPLANE */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 pointer-events-none">
            {/* Flying Airplane – Twin Long Green Contrails */}
            <div className="absolute bottom-10 -right-40 animate-fly-diagonal">
              {/* Airplane Icon */}
              <svg
                className="relative w-28 h-28 text-indigo-600 drop-shadow-2xl z-50 rotate-[-10deg]"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
              </svg>

              {/* LEFT ENGINE – Perfect */}
              <div className="absolute top-20 left-7 w-[1200px] h-1 bg-gradient-to-r from-green-300 via-green-200/70 to-transparent rounded-full blur-[3px] origin-left rotate-[-640deg] opacity-80"></div>

              <div className="absolute top-14 left-7 w-[700px] h-[1px] bg-green-100/90 rounded-full blur-[1px] origin-left rotate-[90deg] opacity-90"></div>

              {/* RIGHT ENGINE – Fixed (no crossing) */}
              <div className="absolute top-14 right-7 w-[1200px] h-1 bg-gradient-to-l from-green-300 via-green-200/70 to-transparent rounded-full blur-[3px] origin-right rotate-[-100deg] opacity-80"></div>

              <div className="absolute top-14 right-7 w-[700px] h-[1px] bg-green-100/90 rounded-full blur-[1px] origin-left rotate-[90deg] opacity-90"></div>
            </div>
          </div>

          {/* Rest of floating icons */}
          <div className="absolute top-32 right-16 animate-float-fast">
            <svg
              className="w-24 h-24 text-teal-600 opacity-30"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm1-13h-2v6l5.25 3.15.75-1.23-4-2.4V7z" />
            </svg>
          </div>

          <div className="absolute bottom-40 left-20 animate-float-medium">
            <svg
              className="w-16 h-16 text-cyan-600 opacity-30"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
            </svg>
          </div>

          <div className="absolute top-1/4 right-32 animate-float-fast">
            <svg
              className="w-14 h-14 text-emerald-500 opacity-25"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 9c-2.73 0-5 2.27-5 5s2.27 5 5 5 5-2.27 5-5-2.27-5-5-5zm0 8c-1.65 0-3-1.35-3-3s1.35-3 3-3 3 1.35 3 3-1.35 3-3 3zm0-10c-3.18 0-6.17 1.72-7.72 4.5l1.44.72C7.27 9.9 9.5 8.5 12 8.5c3.31 0 6 2.69 6 6h2c0-4.42-3.58-8-8-8z" />
            </svg>
          </div>

          <div className="absolute bottom-28 right-24 animate-float-medium">
            <svg
              className="w-20 h-20 text-teal-600 opacity-25"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M18 6h-2V4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H6c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-4 0h-4V4h4v2z" />
            </svg>
          </div>
        </div>

        {/* WAVE BACKGROUND */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            className="w-full h-80"
            viewBox="0 0 1440 320"
            preserveAspectRatio="none"
          >
            <path
              fill="rgba(16, 185, 129, 0.1)"
              d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,320L0,320Z"
            >
              <animate
                attributeName="d"
                dur="14s"
                repeatCount="indefinite"
                values="
                  M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,320L0,320Z;
                  M0,160L48,144C96,128,192,96,288,96C384,96,480,128,576,144C672,160,768,160,864,144C960,128,1056,96,1152,96C1248,96,1344,128,1392,144L1440,160L1440,320L0,320Z;
                  M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,320L0,320Z
                "
              />
            </path>
          </svg>
        </div>
      </div>

      {/* LOGIN FORM */}
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <form onSubmit={onSubmitHandler} className="w-full max-w-md z-10">
          <div className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/60 p-8 sm:p-10">
            <div className="text-center mb-8">
              <img
                src={NewLogo}
                alt="GV - Tour Planners"
                className="mx-auto w-48 sm:w-56 md:w-64 h-auto object-contain drop-shadow-2xl -mb-6 sm:-mb-8"
              />
              <h1 className="mt-10 sm:mt-12 text-2xl sm:text-3xl font-bold text-gray-800">
                <span className="text-indigo-600">
                  {state === "Admin" ? "Admin" : "Tour Admin"}
                </span>{" "}
                Login
              </h1>
              <p className="mt-2 text-sm sm:text-base text-gray-600 font-medium">
                Welcome back! Please log in to continue.
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className={`w-full px-4 py-3.5 rounded-xl border text-base transition-all outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.email || errors.server
                      ? "border-red-500 ring-2 ring-red-200"
                      : "border-gray-300"
                  }`}
                />
                {errors.email && (
                  <p className="mt-1.5 text-xs text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full px-4 py-3.5 rounded-xl border text-base transition-all outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.password || errors.server
                      ? "border-red-500 ring-2 ring-red-200"
                      : "border-gray-300"
                  }`}
                />
                {errors.password && (
                  <p className="mt-1.5 text-xs text-red-600">
                    {errors.password}
                  </p>
                )}
              </div>
            </div>

            {errors.server && (
              <div className="mt-5 p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-700 text-sm text-center font-medium">
                  {errors.server}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-6 w-full py-4 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-bold text-lg rounded-xl shadow-lg transition-all duration-200 active:scale-98"
            >
              {isSubmitting ? "Logging in..." : "Login"}
            </button>

            <div className="mt-8 text-center">
              <p className="text-gray-600 text-sm">
                {state === "Admin" ? (
                  <>
                    Tour Admin login?{" "}
                    <span
                      onClick={() => {
                        setState("Tour Admin");
                        setEmail("");
                        setPassword("");
                        setErrors({ email: "", password: "", server: "" });
                      }}
                      className="text-indigo-600 font-bold underline cursor-pointer hover:text-indigo-700"
                    >
                      Click here
                    </span>
                  </>
                ) : (
                  <>
                    Admin login?{" "}
                    <span
                      onClick={() => {
                        setState("Admin");
                        setEmail("");
                        setPassword("");
                        setErrors({ email: "", password: "", server: "" });
                      }}
                      className="text-indigo-600 font-bold underline cursor-pointer hover:text-indigo-700"
                    >
                      Click here
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>
        </form>
      </div>

      {/* ANIMATIONS */}
      <style>{`
        @keyframes fly-diagonal {
          0% {
            transform: translateX(0) translateY(0) rotate(-35deg);
            opacity: 0;
          }
          8% {
            opacity: 1;
          }
          100% {
            transform: translateX(calc(-100vw - 300px)) translateY(-110vh)
              rotate(-35deg);
            opacity: 0;
          }
        }

        @keyframes float-fast {
          0%,
          100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-18px) rotate(4deg);
          }
        }

        @keyframes float-medium {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-22px);
          }
        }

        @keyframes ping {
          0% {
            transform: scale(0.2);
            opacity: 0.8;
          }
          80% {
            transform: scale(2);
            opacity: 0.3;
          }
          100% {
            transform: scale(3);
            opacity: 0;
          }
        }

        .animate-fly-diagonal {
          animation: fly-diagonal 15s linear infinite;
        }
        .animate-float-fast {
          animation: float-fast 9s ease-in-out infinite;
        }
        .animate-float-medium {
          animation: float-medium 11s ease-in-out infinite;
        }
        .animate-ping {
          animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        .delay-200 {
          animation-delay: 0.2s;
        }
        .delay-500 {
          animation-delay: 0.5s;
        }
        .delay-700 {
          animation-delay: 0.7s;
        }
      `}</style>
    </>
  );
};

export default TourLogin;
