import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, ChevronRight, Lock, HelpCircle } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";

const MerchantSelection = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const recentMerchants = [
    {
      id: 1,
      name: "Kantin 04",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDc8en2F6iUC97-iOfWMoTcrErhEORxya0OMwYtaUzTVeCNhEaFXV4M-rwVOdTGitzYrCXqEJIZUfvoFL4m4DzlW7d6WkLORCRTp-HIT0YqRHncWLCnVUOpAqb8watQIiEfZF8qXao6WYL8PKkGKM9Zt-GtLfLqk41BBfE7ZRq2WkNRnf1POqvkU5b1OOqvrdbVdwerZDCGBp_nVE0AHptPXfLFZSbXe7zCCowxiIGeBz8YxrHVqESf4FYZXEtSwIxqs9bxG2Vt_Y4"
    },
    {
      id: 2,
      name: "Kopi Senja",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBlsDGso5Z6a4lvqST8IoYLurs5PMdolAphsJ1uZTktJQzuKY8Nzf-JtUKw8FEIPpPAlCW7IK7qLaLKaamhwbYm2hpcidKVad-D96AsLjM24A8hWcWNLJLS7CkbldWNYwhDVmHIfYuguke9UvYB3FoLwgOnt9sQimpZa0nORSQ_jcJuyNPSm0sZZw4EqQRrOpBV51_hkBmb6fDo-WoUedLK3USRvWkIE4r40JyCOOJTRSIDCKCukrvyb_JyhC6rkVNfu0xzOy7W0Ks"
    },
    {
      id: 3,
      name: "Dapur Mama",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBDUOfhFPOL4zSYyq0b5k8mCdsJ2M7MMzOI5Y0kSzigmki_TvL4avb8lwHc80EbLhkCHn-5bjv-BuUp6-CpJ-lkmJNg0vjZBCff3hz7sAtId0GSJPUfkW6QhUlL5qfj7YAEU_mKYAt7mI7rW5zNtOXtUDCKqYO_P1nQG5kUXE-5eG-Fl4Q1-m3GQso6Y7UOksYZ5HKrnxHpILy4ejVeDka-3aAKRFri5au6k3GEiId_EsAn8ZeKTD2B-Htk26KUSXnzPHzf3CJk6u8"
    },
    {
      id: 4,
      name: "Fruit Bar",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAxMrsbqMLYNPvGg25YW6az3IvqNFUUsCvIMJWC3fuUVERNq_ri3gnpG9nsq5YOguvX41Hy68sgjwpMl80Y4udAs2JXzaIfS4q1PZZiJKjsskBhyRJHpMG8fukMwRGjG9Jg-X1sm_U3TIgbatuq3K310zk2nL6wWX_lLa4ZzqTAT0qMDfM4IY7nyE5zvURwkhm4wmoLomxYzRMv4sb-MgcwouLbtywm7AY-X0d-U1wltwB2M3CkavuyPWQh3kAHqQIha7HqOLTRoxs"
    },
    {
      id: 5,
      name: "Stand 12",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAis7t1sAedAy1iMdLcjhJrY3ZFdTdOpuqAZYg1kzFL6158rLkcEUzs0IW2gibnGystVX20cbz4Vo2ChI-DM7M8yw-5m5adqurT6RGjCC1Ujeq-uWYRwEpX_N93acBwRSgb1uM3s4WXeKEkRRPi9wIebt8EAOM7CiQKxJtjL_pQiL6clv0G_i1Alts-SKnbsG9XndYTrDe8tu1mocweYciI1H0EQs1-g81Zsdyf4ybfzrRM7ElAAYCyOmj3EjdrvmxxsF0Cs-ItSNo"
    }
  ];

  const canteenCategories = [
    {
      title: "Kantin Utama",
      merchants: [
        {
          id: 6,
          name: "Kantin Pusat 01",
          category: "Masakan Nusantara",
          image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB8DLxro5zEVcQq2TPH6DkgDpjw6nspt81XB08FoWJ1mAO2ibMWOjAVrxXhuBkI9zCAG4biL8Tkwaj5hMltjbggTSOnhHcNmx8IMNGnsTQz_t1TVJKo2TfPsneqmJqiNE8NMVNyRjW3nyDEBp_dj9QPfTATVc2lYUU2qUxiAq3oJB0SG_BZi0H7Vh1qzNP7fDIrCyA55iNbbpih2k8a5GJ48FOXThy3sBvqTrVpAVPwEk8fkzW3DiyxfAR81JWwG3lzrhn3pq_Mw2k",
          status: "open"
        },
        {
          id: 7,
          name: "Steak & Grill",
          category: "Tutup",
          image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAFfjZ1q-cUp_mzu4oC987oaUpPOh0HET_3LDqioWQJDvA5SmiMlpDCOjjkVCMGhxoSfVBxgDz_1lDOC-jhyJ7qeVnVNmlAYxi35tbgTRqr9tP9Toeh_-BX0gkJbR5065f0u9jXVXCNftr9LtoeZGJ5kcSRgesox_FV1DswWLoyn4XE7Ag8KOTiOlC-nGmwIbVmOgm0AbrlKzt6VRheN2Cmv0HQ3BT8Eh-JZPiFo9Dnv5MPkLzia2yYQblOJXycQn26JHnCwumlSZs",
          status: "closed"
        },
        {
          id: 8,
          name: "Kantin 03 (Warteg)",
          category: "Nasi Rames & Lauk",
          image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCa-xEY9MRLI6KHIpFEcNcd_NfxMrREEC67Z7zn_tQ1TC8-6nz5IlRO1020oPQ9RDw-ADcdbKBGZ9ME_znzLmL8j2yDGl2kFRy9KS3AG-DtUJ8nWMhgpkdOKYMYOxA1BAFeqxd9NiCe0rEvNE-6q5G4WxbbP0RarzWAVLu37fCY328vcSeGvNBk5iA_VI8dO6zmPiIh-OOpu_43C2iTfQKAWpUprN8QfJGdzXktZ-2IaGsQ15zAXglXNkmeChzr11WNlrpf9wxcf_M",
          status: "open"
        }
      ]
    },
    {
      title: "Stand Cemilan",
      merchants: [
        {
          id: 9,
          name: "Gorengan Pak No",
          category: "Aneka Gorengan Panas",
          image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCXKBjI2LICmkLVqWuGe5P_NR0OJmhbmh-PJylboIXxb83dRGQjzV18Ba1wKJKj4Saes2z4_s8wsQDEFb72H6siW_OwePPn0mzF70O4PLNPGm9YkyKFAQ8t49kpAhUE-auMPqBJCLv-evOVGGNDcrB27Qb4djGP_4QiozWpzVCAieD66nGhPGELznzHf88vNCTMJArHGfb0LLPeQdvWwsQLY9vpnoR4ZA-qlYCcozoPkaFY5Cueixc-ZZLxx2ExGD5T4U7_xm3Jx1U",
          status: "open"
        },
        {
          id: 10,
          name: "Es Campur Segar",
          category: "Minuman Dingin",
          image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD7FrHfI2y6GFYP0F9j_RY5Yj_x-dhjv512j1mNdub9_T9LmSHQIFzvA4zWAo07ELJjWrX6WrWKNVzOUgFfcuNeYPbgUoMFDBnPcUYDDQRLJPNf5ptL2gKhdhtmZ1Csbr7zr8h7OBEVn4btDQO9bZrg1UXtitxxL4WVcz0dZsdsveISdKshRg-6qknkV0WkGiNN9OkvalocSUvRU67jcKdg6cItC34MaGY4UnwCNNK2Jihy40KFy70dQj3KBFCo5wS9i8REsGgzEp8",
          status: "open"
        }
      ]
    }
  ];

  return (
    <div className="bg-[#0F1112] text-slate-400 min-h-screen pb-24 selection:bg-[#00E676]/30 antialiased font-['Inter',_sans-serif] animate-in fade-in duration-700">
      {/* TopAppBar - Fixed structured using exact pixel heights where relevant */}
      <header className="sticky top-0 z-[60] bg-[#0F1112] border-b border-[#2D3234] animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="flex justify-between items-center w-full px-4 h-16">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-[#1A1D1E] active:scale-95 transition-all outline-none border-none bg-transparent m-0 p-0"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
            <div className="font-['Inter'] font-bold tracking-tight text-lg text-white">Select Merchant</div>
          </div>
          <button className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-[#1A1D1E] active:scale-95 transition-all outline-none border-none bg-transparent m-0 p-0">
            <Search className="w-6 h-6 text-white" />
          </button>
        </div>
        
        {/* Search Bar Section */}
        <div className="px-4 pb-4">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-slate-500 group-focus-within:text-[#00E676] transition-colors" />
            </div>
            <input
              className="block w-full pl-10 pr-4 py-3 bg-[#1A1D1E] border border-[#2D3234] rounded-xl text-sm placeholder-slate-500 focus:ring-1 focus:ring-[#00E676] focus:border-[#00E676] transition-all text-white outline-none font-['Inter']"
              placeholder="Cari nama stand atau kantin..."
              type="text"
            />
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto">
        {/* Terakhir Dikunjungi (Recent) - Matching spacing mt-6 */}
        <section className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150 fill-mode-both">
          <div className="px-4 mb-3 flex justify-between items-center">
            <div className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Terakhir Dikunjungi</div>
          </div>
          <div className="flex overflow-x-auto gap-4 px-4 pb-2 no-scrollbar">
            {isLoading ? (
              [1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex flex-col items-center gap-2 min-w-[72px]">
                  <Skeleton className="w-16 h-16 rounded-2xl bg-[#1A1D1E]" />
                  <Skeleton className="h-3 w-12 bg-[#1A1D1E]" />
                </div>
              ))
            ) : (
              recentMerchants.map((merchant) => (
                <button 
                  key={merchant.id}
                  onClick={() => navigate('/input')}
                  className="flex flex-col items-center gap-2 min-w-[72px] active:scale-95 transition-transform outline-none border-none bg-transparent p-0"
                >
                  <div className="w-16 h-16 rounded-2xl bg-[#1A1D1E] p-[1px] border border-[#2D3234] group-hover:border-[#00E676] transition-colors">
                    <img 
                      className="w-full h-full object-cover rounded-2xl" 
                      src={merchant.image} 
                      alt={merchant.name} 
                    />
                  </div>
                  <div className="text-[11px] font-medium text-slate-400 truncate w-16 text-center font-['Inter']">{merchant.name}</div>
                </button>
              ))
            )}
          </div>
        </section>

        {/* Main Merchant List - Spacing mt-8 px-4 space-y-8 */}
        <div className="mt-8 px-4 space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 fill-mode-both">
          {isLoading ? (
            [1, 2].map((cat) => (
              <div key={cat} className="space-y-4">
                <Skeleton className="h-5 w-32 bg-[#1A1D1E]" />
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full rounded-2xl bg-[#1A1D1E]" />
                  ))}
                </div>
              </div>
            ))
          ) : (
            canteenCategories.map((category, catIdx) => (
              <div key={catIdx}>
                <div className="text-sm font-bold text-[#00E676] mb-4 flex items-center gap-2">
                  <span className="w-1 h-4 bg-[#00E676] rounded-full"></span>
                  {category.title}
                </div>
                <div className="space-y-3">
                  {category.merchants.map((merchant) => (
                    <div 
                      key={merchant.id}
                      onClick={merchant.status === 'open' ? () => navigate('/input') : undefined}
                      className={`group flex items-center justify-between p-3 rounded-2xl border transition-all duration-300 ${
                        merchant.status === 'open' 
                          ? 'bg-[#1A1D1E] border-[#2D3234] hover:border-[#00E676] hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer' 
                          : 'bg-[#131516] border-[#2D3234] opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl overflow-hidden bg-[#2D3234] ${merchant.status !== 'open' ? 'grayscale' : ''}`}>
                          <img className="w-full h-full object-cover" src={merchant.image} alt={merchant.name} />
                        </div>
                        <div className="flex flex-col">
                          <div className={`font-black ${merchant.status === 'open' ? 'text-white' : 'text-slate-500'}`}>{merchant.name}</div>
                          {merchant.status === 'open' ? (
                            <div className="text-xs text-slate-500">{merchant.category}</div>
                          ) : (
                            <div className="flex items-center gap-2 mt-1">
                              <span className="bg-[#2D3234] text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider text-slate-400">Tutup</span>
                            </div>
                          )}
                        </div>
                      </div>
                      {merchant.status === 'open' ? (
                        <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-[#00E676] transition-colors" />
                      ) : (
                        <Lock className="w-5 h-5 text-slate-700" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Floating Action Button */}
      <button className="fixed right-6 bottom-8 w-14 h-14 bg-[#1A1D1E] border border-[#2D3234] rounded-full flex items-center justify-center active:scale-90 transition-all z-40 outline-none shadow-lg p-0">
        <HelpCircle className="w-6 h-6 text-[#00E676]" />
      </button>

      {/* Custom Styles for Hide Scrollbar */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default MerchantSelection;
