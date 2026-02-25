import { Star, ShoppingBag } from 'lucide-react';

export default function FeaturedCarousel({ services = [], products = [], onSelectService }) {
    const featuredServices = services.filter(s => s.isFeatured);
    const featuredProducts = products.filter(p => p.isFeatured);

    if (featuredServices.length === 0 && featuredProducts.length === 0) return null;

    return (
        <div className="mb-6 px-6">
            <h3 className="text-white font-bold uppercase tracking-widest text-xs mb-3 flex items-center gap-2">
                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                Sugestões para você
            </h3>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
                {featuredServices.map(service => (
                    <div key={`feat-svc-${service.id}`} onClick={() => onSelectService(service)} className="min-w-[200px] snap-center bg-[#111] rounded-2xl p-4 border border-yellow-500/20 hover:border-yellow-500 cursor-pointer transition group">
                        <div className="flex justify-between items-start mb-2">
                            <div className="bg-yellow-500/10 text-yellow-500 text-[10px] font-black uppercase px-2 py-1 rounded-lg">Popular</div>
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 group-hover:scale-110 transition" />
                        </div>
                        <h4 className="font-black text-white text-sm uppercase leading-tight mb-1">{service.name}</h4>
                        <p className="text-emerald-500 font-bold text-xs">{Number(service.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                    </div>
                ))}
                {featuredProducts.map(product => (
                    <div key={`feat-prod-${product.id}`} className="min-w-[160px] snap-center bg-[#111] rounded-2xl p-4 border border-blue-500/20 hover:border-blue-500 cursor-pointer transition group">
                        <div className="aspect-square bg-slate-900 rounded-xl mb-3 overflow-hidden">
                            {product.imageUrl ? (
                                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-700">
                                    <ShoppingBag className="w-8 h-8" />
                                </div>
                            )}
                        </div>
                        <h4 className="font-bold text-white text-xs uppercase leading-tight mb-1 line-clamp-1">{product.name}</h4>
                        <p className="text-blue-500 font-bold text-xs">{Number(product.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
