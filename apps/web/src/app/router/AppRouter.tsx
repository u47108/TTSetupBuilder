import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '@/app/layout/AppShell';
import { HomeScreen } from '@/features/home/HomeScreen';
import { ProductsScreen } from '@/features/products/ProductsScreen';
import { ProductDetailScreen } from '@/features/products/ProductDetailScreen';
import { PlayersScreen } from '@/features/players/PlayersScreen';
import { PlayerDetailScreen } from '@/features/players/PlayerDetailScreen';
import { BrandsScreen } from '@/features/brands/BrandsScreen';
import { SearchScreen } from '@/features/search/SearchScreen';
import { CompareScreen } from '@/features/compare/CompareScreen';
import { BuilderScreen } from '@/features/builder/BuilderScreen';
import { routerBasename } from '@/shared/lib/publicAssetUrl';

export function AppRouter() {
  return (
    <BrowserRouter basename={routerBasename()}>

      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<HomeScreen />} />
          <Route path="products" element={<ProductsScreen />} />
          <Route path="products/:slug" element={<ProductDetailScreen />} />
          <Route path="players" element={<PlayersScreen />} />
          <Route path="players/:slug" element={<PlayerDetailScreen />} />
          <Route path="brands" element={<BrandsScreen />} />
          <Route path="search" element={<SearchScreen />} />
          <Route path="compare" element={<CompareScreen />} />
          <Route path="builder" element={<BuilderScreen />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
