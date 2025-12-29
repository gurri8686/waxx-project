"use client";

import { useState, useEffect } from "react";
import CryptoJS from "crypto-js";
import Image from "next/image";
import Link from "next/link";

export default function BrandsPage() {
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Generate nonce
  function generateNonce(length: number) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // HMAC-SHA256 signature
  function generateSignature(secretKey: string, message: string) {
    const hmac = CryptoJS.HmacSHA256(message, secretKey);
    return hmac.toString(CryptoJS.enc.Hex);
  }

  const secretKey = "c2add694bf942dc77b376592d9c862c";

  const fetchAllBrands = async () => {
    setLoading(true);
    setError(null);

    const timestamp = Date.now().toString();
    const nonce = generateNonce(16);

    // For getAllBrand, there are no query params
    const messageToSign = `${timestamp}\n${nonce}\n`;
    const signature = generateSignature(secretKey, messageToSign);

    try {
      const res = await fetch("https://app.unicoreus.com/supplement/front/waxx/getAllBrand", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-Timestamp": timestamp,
          "X-Nonce": nonce,
          "X-App-Key": secretKey,
          "X-Signature": signature,
        },
      });

      const json = await res.json();
      if (json.success && json.data) {
        setBrands(json.data);
      } else {
        setError(json.message || "Failed to fetch brands");
      }
    } catch (e: any) {
      setError("Failed to fetch brands. Please try again.");
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchAllBrands();
  }, []);

  return (
    <div className="min-h-screen bg-[#1a1a1a] p-4 pb-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="p-2 hover:bg-[#333] rounded-lg transition-colors">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex-1 flex justify-center">
            <Image src="/logo.png" alt="Waxx Brandz" width={120} height={42} priority />
          </div>
          <div className="w-10" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-[#F5C518] text-center mb-6">All Brands</h1>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center py-16">
            <div className="w-12 h-12 border-4 border-[#F5C518]/30 border-t-[#F5C518] rounded-full animate-spin mb-4" />
            <p className="text-gray-400 text-sm">Loading brands...</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-center">
            <p className="text-red-400">{error}</p>
            <button
              onClick={fetchAllBrands}
              className="mt-3 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Brands List */}
        {!loading && !error && brands.length > 0 && (
          <div className="grid gap-4">
            {brands.map((brand: any) => (
              <div
                key={brand.brandId}
                className="bg-[#252525] rounded-2xl border border-[#333] overflow-hidden"
              >
                {/* Cover Image */}
                {brand.brandCoverImage && (
                  <div className="h-32 bg-[#1a1a1a] overflow-hidden">
                    <img
                      src={brand.brandCoverImage}
                      alt={brand.brandName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="p-4">
                  {/* Brand Header */}
                  <div className="flex items-center gap-4 mb-3">
                    {brand.brandLogo && (
                      <img
                        src={brand.brandLogo}
                        alt={brand.brandName}
                        className="w-14 h-14 rounded-xl object-cover bg-[#1a1a1a]"
                      />
                    )}
                    <div className="flex-1">
                      <h2 className="text-lg font-bold text-white">{brand.brandName}</h2>
                      <p className="text-xs text-gray-500">ID: {brand.brandId}</p>
                    </div>
                  </div>

                  {/* Introduction */}
                  {brand.brandIntroduction && brand.brandIntroduction !== "-" && (
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                      {brand.brandIntroduction}
                    </p>
                  )}

                  {/* Links */}
                  <div className="flex flex-wrap gap-2">
                    {brand.brandUrl && brand.brandUrl !== "-" && (
                      <a
                        href={brand.brandUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-3 py-1.5 bg-[#1a1a1a] hover:bg-[#333] text-gray-300 text-sm rounded-lg transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                        </svg>
                        Website
                      </a>
                    )}
                    {brand.brandIns && brand.brandIns !== "-" && (
                      <a
                        href={brand.brandIns}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-3 py-1.5 bg-[#1a1a1a] hover:bg-[#333] text-gray-300 text-sm rounded-lg transition-colors"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                        Instagram
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Brands */}
        {!loading && !error && brands.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-400">No brands found</p>
          </div>
        )}

        {/* Stats */}
        {!loading && !error && brands.length > 0 && (
          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm">
              Total: <span className="text-[#F5C518] font-semibold">{brands.length}</span> brands
            </p>
          </div>
        )}

        {/* Footer */}
        <p className="mt-8 text-gray-600 text-xs text-center">
          © 2024 Waxx Brandz. All rights reserved.
        </p>
      </div>
    </div>
  );
}

