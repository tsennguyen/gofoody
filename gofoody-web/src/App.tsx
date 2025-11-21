import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <>
      <Header />
      <main className="container" style={{ padding: '24px 0 32px' }}>
        <AppRoutes />
      </main>
      <Footer />
    </>
  );
}

export default App;
