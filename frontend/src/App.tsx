import PracticeView from './components/PracticeView';
// Removed CSS import

function App() {
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Flashcard Learner</h1>
      </header>
      <main className="app-content">
        <PracticeView />
      </main>
      <footer className="app-footer">
        <p>&copy; {new Date().getFullYear()} Flashcard Learner</p>
      </footer>
    </div>
  );
}

export default App;