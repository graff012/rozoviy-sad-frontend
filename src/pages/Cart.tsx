import { useState } from "react";
import { useCart } from "../contexts/CartContext";
import { useOrders } from "../contexts/OrdersContext";
import { Link, useNavigate } from "react-router-dom";
import {
  FaShoppingCart,
  FaTrash,
  FaPlus,
  FaMinus,
  FaArrowLeft,
} from "react-icons/fa";
import { API_URL, CARD_NUMBER, BASE_URL } from "../config";

interface FormData {
  firstName: string;
  telegram_username: string;
  phoneNumber: string;
  address: string;
}

// Using shared BASE_URL derived in config

// Helper function to construct proper image URL
const getImageUrl = (imgUrl: string | undefined): string => {
  if (!imgUrl) {
    return "/placeholder.jpg"; // Fallback to placeholder if no URL
  }
  if (imgUrl.startsWith("http")) {
    return imgUrl; // Return full URL if it’s already absolute
  }
  const cleanPath = imgUrl.startsWith("/") ? imgUrl.slice(1) : imgUrl;
  const imgPath = cleanPath.startsWith("images") ? cleanPath : `images/${cleanPath}`;
  const fullUrl = `${BASE_URL}/${imgPath}`;
  console.log(`Image URL construction - Input: "${imgUrl}" -> Output: "${fullUrl}"`);
  return fullUrl;
};

const Cart = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    telegram_username: "",
    phoneNumber: "",
    address: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    cartTotal,
    clearCart,
    itemCount,
  } = useCart();
  const { addOrder } = useOrders();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  // PDF generation (unchanged)
  const generateOrderPDF = async () => {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();

    doc.setFont('helvetica', 'normal')

    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text("Rozoviy Sad", 105, 20, { align: "center" });

    doc.setFontSize(14);
    doc.text("Buyurtma xati", 105, 30, { align: "center" });

    doc.setFontSize(12);
    doc.text(`Mijoz: ${formData.firstName}`, 20, 50);
    doc.text(`Telegram: ${formData.telegram_username}`, 20, 60);
    doc.text(`Telefon: ${formData.phoneNumber}`, 20, 70);
    doc.text(`Manzil: ${formData.address}`, 20, 80);

    doc.setFillColor(200, 200, 200);
    doc.rect(20, 95, 170, 10, "F");
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.text("Nomi", 25, 102);
    doc.text("Narxi", 100, 102);
    doc.text("Soni", 140, 102);
    doc.text("Jami", 170, 102, { align: "right" });

    // Add this helper function
    const transliterateCyrillic = (text: string): string => {
      const cyrillicToLatin: { [key: string]: string } = {
        'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'Yo',
        'Ж': 'Zh', 'З': 'Z', 'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M',
        'Н': 'N', 'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U',
        'Ф': 'F', 'Х': 'Kh', 'Ц': 'Ts', 'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Shch',
        'Ъ': '', 'Ы': 'Y', 'Ь': '', 'Э': 'E', 'Ю': 'Yu', 'Я': 'Ya',
        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
        'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
        'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
        'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch',
        'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
      };

      return text.replace(/[А-я]/g, (char) => cyrillicToLatin[char] || char);
    };

    doc.setFont("helvetica", "normal");
    let yPosition = 110;
    cartItems.forEach((item) => {

      const itemTotal = Number(item.price) * item.quantity;

      const displayName = transliterateCyrillic(item.name)

      doc.text(displayName, 25, yPosition);
      doc.text(`${Number(item.price).toLocaleString()} UZS`, 100, yPosition);
      doc.text(item.quantity.toString(), 140, yPosition);
      doc.text(itemTotal.toLocaleString() + " UZS", 170, yPosition, {
        align: "right",
      });
      yPosition += 10;
    });

    console.log('Cart items for PDF:', cartItems.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity
    })));

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Umumiy summa:", 100, yPosition + 20);
    doc.text(`${cartTotal.toLocaleString()} UZS`, 170, yPosition + 20, {
      align: "right",
    });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(`Quyidagi karta raqamiga to'lov qiling`, 20, yPosition + 40);
    doc.text(`Karta raqami: ${CARD_NUMBER}`, 20, yPosition + 50);
    doc.text(`To'lov screenshotini https://t.me/rozoviysaduz ga telegramdan yuboring`, 20, yPosition + 60);
    doc.setFontSize(12);
    doc.text(`To'lov muddati: 10 kun ichida`, 20, yPosition + 70);
    doc.setFontSize(10);
    doc.text(`Sana: ${new Date().toLocaleDateString()}`, 20, yPosition + 80);

    doc.save(`buyurtma_${new Date().getTime()}.pdf`);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Validate form
    if (
      !formData.firstName ||
      !formData.telegram_username ||
      !formData.phoneNumber ||
      !formData.address
    ) {
      setError("Iltimos, barcha maydonlarni to'ldiring");
      setIsSubmitting(false);
      return;
    }

    try {
      // === 1. CREATE ORDER ===
      const orderPayload = {
        name: formData.firstName.trim(),
        phone_number: formData.phoneNumber.trim(),
        address: formData.address.trim(),
        telegram_username: formData.telegram_username.trim(),
      };

      const orderResponse = await fetch(`${API_URL}/orders/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(orderPayload),
      });

      if (!orderResponse.ok) {
        const errorText = await orderResponse.text();
        console.error("Order creation failed:", errorText);
        throw new Error(
          `Failed to create order: ${orderResponse.status} ${errorText}`
        );
      }

      const { order: createdOrder } = await orderResponse.json();

      if (!createdOrder?.id) {
        throw new Error("Order created but no ID returned");
      }

      console.log("Order created with ID:", createdOrder.id);

      // === 2. CREATE ORDER ITEMS ===
      const itemPromises = cartItems.map(async (item) => {
        const itemPayload = {
          flower_id: item.id,
          order_id: createdOrder.id,
          quantity: item.quantity,
          price: Number(item.price),
        };

        console.log("Creating order item:", itemPayload); // 🔍 Debug

        const itemResponse = await fetch(`${API_URL}/order-items/create`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(itemPayload),
        });

        if (!itemResponse.ok) {
          const errorText = await itemResponse.text();
          console.error(`Failed to create item for ${item.name}:`, errorText);
          throw new Error(`Failed to create item: ${errorText}`);
        }

        const result = await itemResponse.json();
        console.log("Item created:", result);
        return result;
      });

      // ✅ Wait for all items — and fail if any fails
      await Promise.all(itemPromises);

      console.log("All order items created successfully");

      // === 3. UPDATE FRONTEND STATE (optional) ===
      const frontendOrder = {
        id: createdOrder.id,
        customer: {
          name: formData.firstName.trim(),
          phone: formData.phoneNumber.trim(),
          address: formData.address.trim(),
          telegram_username: formData.telegram_username.trim(),
        },
        items: cartItems.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          price: Number(item.price),
          total: Number(item.price) * item.quantity,
        })),
        total: cartTotal,
        status: "pending" as const,
        date: new Date().toISOString(),
      };

      addOrder(frontendOrder);

      // === 4. GENERATE PDF ===
      await generateOrderPDF();

      // === 5. CLEAN UP & REDIRECT ===
      clearCart();
      navigate("/order-success");
    } catch (err) {
      console.error("Xatolik yuz berdi:", err);
      setError(
        "Buyurtma qilishda xatolik yuz berdi. Iltimos, keyinroq qayta urinib ko'ring."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (itemCount === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
        <div className="text-center">
          <FaShoppingCart className="mx-auto text-6xl text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Savat bo'sh</h2>
          <p className="text-gray-600 mb-6">
            Hozircha savatingiz bo'sh ko'rinadi
          </p>
          <Link
            to="/"
            className="inline-block bg-pink-500 text-white px-6 py-2 rounded-full hover:bg-pink-600 transition-colors"
          >
            Xaridni davom ettirish
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-8">
        <form onSubmit={handleSubmit}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center mb-6">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
              >
                <FaArrowLeft className="mr-2" />
                Orqaga
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Savat</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-6">
                      Savatingiz
                    </h2>

                    <div className="divide-y divide-gray-200">
                      {cartItems.map((item) => (
                        <div key={item.id} className="py-4 flex">
                          <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                            <img
                              src={getImageUrl(item.imgUrl)}
                              alt={item.name}
                              className="h-full w-full object-cover object-center"
                              onError={(e) => {
                                e.currentTarget.src = "/placeholder.jpg"; // Fallback if image fails to load concentre
                              }}
                            />
                          </div>

                          <div className="ml-4 flex-1 flex flex-col">
                            <div>
                              <div className="flex justify-between text-base font-medium text-gray-900">
                                <h3>{item.name}</h3>
                                <p className="ml-4">
                                  {Number(item.price).toLocaleString()} UZS
                                </p>
                              </div>
                              {"category" in item && item.category && (
                                <p className="mt-1 text-sm text-gray-500">
                                  {item.category}
                                </p>
                              )}
                            </div>

                            <div className="flex-1 flex items-end justify-between text-sm">
                              <div className="flex items-center">
                                <button
                                  onClick={() =>
                                    updateQuantity(item.id, item.quantity - 1)
                                  }
                                  className="text-gray-500 hover:text-gray-700 p-1"
                                  disabled={item.quantity <= 1}
                                >
                                  <FaMinus className="h-4 w-4" />
                                </button>
                                <span className="mx-2 text-gray-700">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() =>
                                    updateQuantity(item.id, item.quantity + 1)
                                  }
                                  className="text-gray-500 hover:text-gray-700 p-1"
                                >
                                  <FaPlus className="h-4 w-4" />
                                </button>
                              </div>

                              <button
                                type="button"
                                onClick={() => removeFromCart(item.id)}
                                className="font-medium text-pink-600 hover:text-pink-500"
                              >
                                <FaTrash className="h-5 w-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                      Aloqa ma'lumotlari
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label
                          htmlFor="firstName"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Ism va Familiya *
                        </label>
                        <input
                          type="text"
                          id="firstName"
                          required
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="telegram_username"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Telegram username *
                        </label>
                        <input
                          type="text"
                          id="telegram_username"
                          required
                          value={formData.telegram_username}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div className="mb-4">
                      <label
                        htmlFor="phoneNumber"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Telefon raqami *
                      </label>
                      <input
                        type="tel"
                        id="phoneNumber"
                        required
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        placeholder="+998 (__) ___-__-__"
                      />
                    </div>
                    <div className="mb-6">
                      <label
                        htmlFor="address"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Yetkazib berish manzili *
                      </label>
                      <textarea
                        id="address"
                        rows={3}
                        value={formData.address}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      ></textarea>
                    </div>

                    {error && (
                      <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg">
                        {error}
                      </div>
                    )}

                    <div className="mt-6">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-gradient-to-r from-pink-500 to-pink-600 text-white py-3 px-6 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {isSubmitting
                          ? "Buyurtma qilinmoqda..."
                          : "Buyurtma berish"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">
                    Buyurtma xulosasi
                  </h2>
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex justify-between">
                        <span className="text-gray-600">
                          {item.name} × {item.quantity}
                        </span>
                        <span className="font-medium">
                          {(Number(item.price) * item.quantity).toLocaleString()} UZS
                        </span>
                      </div>
                    ))}
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Jami:</span>
                        <span>{cartTotal.toLocaleString()} UZS</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <Link
                    to="/"
                    className="inline-flex items-center gap-2 text-pink-600 hover:text-pink-700 font-medium transition-colors"
                  >
                    <FaArrowLeft size={12} /> Orqaga qaytish
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Cart;
