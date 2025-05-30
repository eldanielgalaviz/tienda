"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

export default function AdminNavLink() {
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const response = await fetch('/api/auth/me');
        const data = await response.json();
        
        if (data && data.user) {
          setIsAdmin(Boolean(data.user.is_admin));
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
      }
    };
    
    checkAdmin();
  }, []);
  
  if (!isAdmin) return null;
  
  return (
    <Link href="/admin" className="text-sm font-medium px-3 py-2 rounded-md bg-red-500 text-white hover:bg-red-700 transition-colors">
      PANEL ADMIN
    </Link>
  );
}