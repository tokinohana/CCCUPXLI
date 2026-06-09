import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, ChevronRight } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";

const MerchantSelection = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // 🌟 Active state array to store live data fetched from your backend models
  const [merchants, setMerchants] = useState([]);

  // Fetch the full roster of active merchant nodes from the backend
  const fetchMerchants = async () => {
    try {
      // Points to your backend list view. Adjust the URL path if your URL router differs
      const response = await fetch('/api/ccpay/merchants/list/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Assumes your backend returns an array of objects matching: { id, name, token }
        // Fallback images are gracefully handled inline to fit your static presentation rules
        const formattedData = data.map((item, idx) => ({
          id: item.id,
          name: item.name,
          token: item.token,
          image: item.image || `http://googleusercontent.com/profile/picture/${(idx % 5) + 2}`
        }));
        setMerchants(formattedData);
      } else {
        // Safe structural fallback array so your UI stays operational if backend is offline
        setMerchants([
          { id: 1, name: "Kantin Pusat 01", token: "token_01", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB8DLxro5zEVcQq2TPH6DkgDpjw6nspt81XB08FoWJ1mAO2ibMWOjAVrxXhuBkI9zCAG4biL8Tkwaj5hMltjbggTSOnhHcNmx8IMNGnsTQz_t1TVJKo2TfPsneqmJqiNE8NMVNyRjW3nyDEBp_dj9QPfTATVc2lYUU2qUxiAq3oJB0SG_BZi0H7Vh1qzNP7fDIrCyA55iNbbpih2k8a5GJ48FOXThy3sBvqTrVpAVPwEk8fkzW3DiyxfAR81JWwG3lzrhn3pq_Mw2k" },
          { id: 2, name: "Steak & Grill", token: "token_02", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAFfjZ1q-cUp_mzu4oC987oaUpPOh0HET_3LDqioWQJDvA5SmiMlpDCOjjkVCMGhxoSfVBxgDz_1lDOC-jhyJ7qeVnVNmlAYxi35tbgTRqr9tP9Toeh_-BX0gkJbR5065f0u9jXVXCNftr9LtoeZGJ5kcSRgesox_FV1DswWLoyn4XE7Ag8KOTiOlC-nGmwIbVmOgm0AbrlKzt6VRheN2Cmv0HQ3BT8Eh-JZPiFo9Dnv5MPkLzia2yYQblOJXycQn26JHnCwumlSZs" },
          { id: 3, name: "Kantin 03 (Warteg)", token: "token_03", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCa-xEY9MRLI6KHIpFEcNcd_NfxMrREEC67Z7zn_tQ1TC8-6nz5IlRO1020oPQ9RDw-ADcdbKBGZ9ME_znzLmL8j2yDGl2kFRy9KS3AG-DtUJ8nWMhgpkdOKYMYOxA1BAFeqxd9NiCe0rEvNE-6q5G4WxbbP0RarzWAVLu37fCY328vcSeGvNBk5iA_VI8dO6zmPiIh-OOpu_43C2iTfQKAWpUprN8QfJGdzXktZ-2IaGsQ15zAXglXNkmeChzr11WNlrpf9wxcf_M" },
          { id: 4, name: "Gorengan Pak No", token: "token_04", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCXKBjI2LICmkLVqWuGe5P_NR0OJmhbmh-PJylboIXxb83dRGQjzV18Ba1wKJKj4Saes2z4_s8wsQDEFb72H6siW_OwePPn0mzF70O4PLNPGm9YkyKFAQ8t49kpAhUE-auMPqBJCLv-evOVGGNDcrB27Qb4djGP_4QiozWpzVCAieD66nGhPGELznzHf88vNCTMJArHGfb0LLPeQdvWwsQLY9vpnoR4ZA-qlYCcozoPkaFY5Cueixc-ZZLxx2ExGD5T4U7_xm3Jx1U" },
          { id: 5, name: "Es Campur Segar", token: "token_05", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD7FrHfI2y6GFYP0F9j_RY5Yj_x-dhjv512j1mNdub9_T9LmSHQIFzvA4zWAo07ELJjWrX6WrWKNVzOUgFfcuNeYPbgUoMFDBnPcUYDDQRLJPNf5ptL2gKhdhtmZ1Csbr7zr8h7OBEVn4btDQO9bZrg1UXtitxxL4WVcz0dZsdsveISdKshRg-6qknkV0WkGiNN9OkvalocSUvRU67jcKdg6cItC34MaGY4UnwCNNK2Jihy40KFy70dQj3KBFCo5wS9i8REsGgzEp8" }
        ]);
      }
    } catch (error) {
      console.error("Error connecting to merchant registry api:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMerchants();
  }, []);

  // Filter functionality tracking search bar matrix matches
  const filteredMerchants = merchants.filter(merchant =>
    merchant.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 🌟 Handle selection logic securely bounding terminal state settings before routing
  const handleSelectMerchant = (merchant) => {
    // Save the unique token required by your ProcessPaymentView and MerchantDashboardView endpoints
    localStorage.setItem('merchant_token', merchant.token);
    
    // Bubble the chosen instance up into the router navigation stack matching your interface setup
    navigate('/input', { state: { merchant } });
  };

  return (
    <div className="bg-[#090a0b] text-[#8a939e] min-h-screen pb-24 font-sans antialiased selection:bg-[#69ff87]/30 w-full overflow-x-hidden">
      
      {/* Matte Action Header Bar */}
      <header className="sticky top-0 z-40 bg-[#090a0b]/80 backdrop-blur-md border-b border-[#16191d] px-4 py-4">
        <div className="max-w-xl mx-auto flex flex-col space-y-4">
          
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => navigate(-1)}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#131619] border border-[#1e2226] text-[#8a939e] hover:text-white transition-all active:scale-95"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-base font-black text-white tracking-tight">Select Merchant</h1>
              <p className="text-[10px] font-bold text-[#535c66] uppercase tracking-widest mt-0.5">Manual Entry</p>
            </div>
          </div>

          {/* Unified Fluid Search Box Input */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-[#535c66] group-focus-within:text-[#69ff87] transition-colors" />
            </div>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-4 py-3 bg-[#131619] border border-[#1e2226] rounded-xl text-xs placeholder-[#535c66] text-white outline-none focus:border-[#69ff87]/50 transition-all font-medium"
              placeholder="Cari nama stand atau kantin..."
              type="text"
            />
          </div>

        </div>
      </header>

      {/* Main Merchant Flat List Display Area */}
      <main className="max-w-xl mx-auto px-4 mt-6">
        <div className="space-y-2.5">
          {isLoading ? (
            [1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl bg-[#131619]" />
            ))
          ) : (
            filteredMerchants.map((merchant) => (
              <div 
                key={merchant.id}
                onClick={() => handleSelectMerchant(merchant)}
                className="group flex items-center justify-between p-3 rounded-xl border bg-[#131619] border-[#1e2226] hover:border-[#69ff87]/40 active:scale-[0.99] cursor-pointer transition-all duration-200"
              >
                <div className="flex items-center space-x-3.5 min-w-0">
                  {/* Thumbnail Avatar Frame */}
                  <div className="w-11 h-11 rounded-lg overflow-hidden bg-[#1a1d21] border border-[#2a2f35] flex-shrink-0">
                    <img className="w-full h-full object-cover" src={merchant.image} alt={merchant.name} />
                  </div>
                  
                  {/* Title Label */}
                  <div className="min-w-0">
                    <span className="text-xs font-bold tracking-tight truncate text-white group-hover:text-[#69ff87] transition-colors block">
                      {merchant.name}
                    </span>
                  </div>
                </div>

                {/* Micro chevron arrow trail indicator */}
                <div className="flex-shrink-0 ml-3">
                  <ChevronRight className="w-4 h-4 text-[#535c66] group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                </div>

              </div>
            ))
          )}

          {!isLoading && filteredMerchants.length === 0 && (
            <div className="text-center py-12 text-xs font-medium text-[#535c66]">
              No merchants match your filter parameters
            </div>
          )}
        </div>
      </main>

    </div>
  );
};

export default MerchantSelection;