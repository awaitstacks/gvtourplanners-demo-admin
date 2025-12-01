import React, { useContext, useState, useEffect } from "react";
import { TourAdminContext } from "../context/TourAdminContext.jsx";
import { TourContext } from "../context/TourContext.jsx";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const TourLogin = () => {
  const [state, setState] = useState("Admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ email: "", password: "", server: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setAToken, backendUrl } = useContext(TourAdminContext);
  const { setttoken } = useContext(TourContext);

  // Clear toasts on component unmount
  useEffect(() => {
    return () => {
      toast.dismiss();
    };
  }, []);

  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Validate fields (client-side)
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

  // Handle input changes with validation
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setErrors((prev) => ({ ...prev, server: "" })); // Clear server error on change
    validateFields();
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setErrors((prev) => ({ ...prev, server: "" })); // Clear server error on change
    validateFields();
  };

  // Handle blur events with client-side validation and toasts
  const handleEmailBlur = () => {
    if (!email) {
      setErrors((prev) => ({ ...prev, email: "Email is required" }));
      toast.error("Email is required", { toastId: "email-required" });
    } else if (!emailRegex.test(email)) {
      setErrors((prev) => ({ ...prev, email: "Invalid email format" }));
      toast.error("Invalid email format", { toastId: "email-format" });
    } else {
      setErrors((prev) => ({ ...prev, email: "" }));
    }
  };

  const handlePasswordBlur = () => {
    if (!password) {
      setErrors((prev) => ({ ...prev, password: "Password is required" }));
      toast.error("Password is required", { toastId: "password-required" });
    } else if (password.length < 6) {
      setErrors((prev) => ({
        ...prev,
        password: "Password must be at least 6 characters",
      }));
      toast.error("Password must be at least 6 characters", {
        toastId: "password-length",
      });
    } else {
      setErrors((prev) => ({ ...prev, password: "" }));
    }
  };

  // Handle form submission
  const onSubmitHandler = async (event) => {
    event.preventDefault();
    if (!validateFields()) {
      toast.error("Please fix the errors in the form", {
        toastId: "form-errors",
      });
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
          toast.success("Admin login successful", {
            toastId: "admin-login-success",
          });
        } else {
          setErrors((prev) => ({ ...prev, server: data.message }));
          toast.error(data.message, { toastId: "admin-login-error" });
        }
      } else {
        const { data } = await axios.post(backendUrl + "/api/tour/login", {
          email,
          password,
        });
        if (data.success) {
          localStorage.setItem("ttoken", data.token);
          setttoken(data.token);
          toast.success("Tour login successful", {
            toastId: "tour-login-success",
          });
        } else {
          setErrors((prev) => ({ ...prev, server: data.message }));
          toast.error(data.message, { toastId: "tour-login-error" });
        }
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "An error occurred";
      setErrors((prev) => ({ ...prev, server: errorMessage }));
      toast.error(errorMessage, { toastId: "server-error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmitHandler} className="min-h-[80vh] flex items-center">
      <div className="flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-[#5E5E5E] text-sm shadow-lg">
        <p className="text-2xl font-semibold m-auto">
          <span className="text-primary">{state}</span> Login
        </p>
        <div className="w-full">
          <p>Email</p>
          <input
            onChange={handleEmailChange}
            onBlur={handleEmailBlur}
            value={email}
            className={`border rounded w-full p-2 mt-1 ${
              errors.email || errors.server
                ? "border-red-500"
                : "border-[#DADADA]"
            }`}
            type="email"
            required
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email}</p>
          )}
        </div>
        <div className="w-full">
          <p>Password</p>
          <input
            onChange={handlePasswordChange}
            onBlur={handlePasswordBlur}
            value={password}
            className={`border rounded w-full p-2 mt-1 ${
              errors.password || errors.server
                ? "border-red-500"
                : "border-[#DADADA]"
            }`}
            type="password"
            required
          />
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">{errors.password}</p>
          )}
        </div>
        {errors.server && (
          <p className="text-red-500 text-xs mt-1 w-full text-center">
            {errors.server}
          </p>
        )}
        <button
          className={`bg-primary text-white w-full py-2 rounded-md text-base ${
            isSubmitting || errors.email || errors.password
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-primary-dark"
          }`}
          type="submit"
          disabled={isSubmitting || errors.email || errors.password}
        >
          {isSubmitting ? "Logging in..." : "Login"}
        </button>
        {state === "Admin" ? (
          <p>
            Tour login?{" "}
            <span
              className="text-primary underline cursor-pointer"
              onClick={() => {
                setState("Tour");
                setEmail("");
                setPassword("");
                setErrors({ email: "", password: "", server: "" });
              }}
            >
              Click here
            </span>
          </p>
        ) : (
          <p>
            Admin login?{" "}
            <span
              className="text-primary underline cursor-pointer"
              onClick={() => {
                setState("Admin");
                setEmail("");
                setPassword("");
                setErrors({ email: "", password: "", server: "" });
              }}
            >
              Click here
            </span>
          </p>
        )}
      </div>
    </form>
  );
};

export default TourLogin;
