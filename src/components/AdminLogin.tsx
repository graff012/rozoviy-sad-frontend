import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "../contexts/AdminAuthContext";
import { API_URL } from "../config";

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    phoneNumber: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAdminAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.phoneNumber || !formData.password) {
      setError("Iltimos, barcha maydonlarni to'ldiring");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          phoneNumber: formData.phoneNumber, // Using camelCase to match backend DTO
          password: formData.password,
          isAdmin: true
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Kirish muvaffaqiyatsiz. Iltimos, ma'lumotlarni tekshiring.");
      }

      if (!data.token) {
        throw new Error("Kirish tokeni topilmadi. Iltimos, qaytadan urinib ko'ring.");
      }

      // Store the token and redirect
      await login(data.token, () => {
        navigate('/admin');
      });

    } catch (err) {
      console.error("Login error:", err);
      setError(err instanceof Error ? err.message : "Tizimda xatolik yuz berdi. Iltimos, keyinroq urinib ko'ring.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-[#f8f6fa] py-10">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-black font-[Chillax] mb-2">
            Admin Login
          </h1>
          <p className="text-gray-600">
            Sign in to access the admin panel
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-black mb-2"
            >
              Phone Number
            </label>
            <input
              type="text"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="Enter your phone number"
              className="w-full border border-[#e7d6e0] rounded-lg py-3 px-4 bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#f2b5d4] focus:border-transparent transition"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-black mb-2"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className="w-full border border-[#e7d6e0] rounded-lg py-3 px-4 bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#f2b5d4] focus:border-transparent transition"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#f2b5d4] hover:bg-[#e7a3c4] disabled:bg-gray-300 disabled:cursor-not-allowed text-black font-semibold py-3 px-6 rounded-lg shadow transition duration-200"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </span>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Footer */}
        {/* <div className="mt-8 text-center"> */}
        {/*   <p className="text-sm text-gray-600"> */}
        {/*     Forgot your password?{" "} */}
        {/*     <a */}
        {/*       href="/forgot-password" */}
        {/*       className="text-[#f2b5d4] hover:text-[#e7a3c4] font-medium" */}
        {/*     > */}
        {/*       Reset it here */}
        {/*     </a> */}
        {/*   </p> */}
        {/* </div> */}
      </div>
    </section>
  );
};

export default AdminLogin;
