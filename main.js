// Main Application JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // App State
    const state = {
        currentMood: null,
        currentLanguage: 'en',
        currentTheme: 'light',
        movies: [], // Will be filled from JSON
        filteredMovies: [],
        autoTimerInterval: null,
        timerCount: 3,
        isEatingMode: false,
        eatingType: null,
        deferredPrompt: null,
        viewedMovies: new Set(), // Track movies shown in current session
        weeklyViewed: new Set(), // Track movies viewed this week
        allMoviesLoaded: false, // Track if all movies are loaded
        quickPickHistory: [] // Track quick picks for better recommendations
    };

    // DOM Elements
    const elements = {
        themeToggle: document.getElementById('themeToggle'),
        langButtons: document.querySelectorAll('.lang-btn'),
        quickButtons: document.querySelectorAll('.quick-btn'),
        moodGrid: document.querySelector('.mood-grid'),
        surpriseBtn: document.getElementById('surpriseMe'),
        eatingBtn: document.getElementById('eatingMode'),
        movieGrid: document.getElementById('movieGrid'),
        currentMoodTitle: document.getElementById('currentMoodTitle'),
        shuffleBtn: document.getElementById('shuffleBtn'),
        backBtn: document.getElementById('backBtn'),
        eatingOptions: document.getElementById('eatingOptions'),
        eatingButtons: document.querySelectorAll('.eating-btn'),
        loadingOverlay: document.getElementById('loadingOverlay'),
        autoMoodTimer: document.getElementById('autoMoodTimer'),
        notificationSound: document.getElementById('notificationSound'),
        installBtn: document.getElementById('installBtn')
    };

    // Initialize App
    function initApp() {
        setupEventListeners();
        setupAutoMoodTimer();
        updateLanguage(state.currentLanguage);
        applyTheme(state.currentTheme);
        renderMoodButtons();
        setupPWAInstall();
        loadWeeklyViewed();

        // Check if app is installed
        checkIfInstalled();

        // Load movies from JSON
        loadMoviesFromJSON();
    }

    // Load movies from JSON file
    async function loadMoviesFromJSON() {
        showLoading();

        try {
            const response = await fetch('movies.json');
            if (!response.ok) throw new Error('JSON file not found');

            const data = await response.json();
            const movies = data.movies || [];

            // Process all movies
            movies.forEach(movie => {
                const movieWithPoster = addPosterUrl(movie);
                state.movies.push(movieWithPoster);
            });

            state.allMoviesLoaded = true;
            console.log(`Loaded ${state.movies.length} movies from JSON`);

            // Show notification
            showNotification(state.currentLanguage === 'en'
                ? `✨ Loaded ${state.movies.length} movies!`
                : `✨ ${state.movies.length} திரைப்படங்கள் ஏற்றப்பட்டன!`);

        } catch (error) {
            console.error('Error loading movies:', error);
            showNotification(state.currentLanguage === 'en'
                ? '⚠️ Using sample movies'
                : '⚠️ மாதிரி திரைப்படங்கள் பயன்படுத்தப்படுகின்றன');

            // Load sample movies as fallback
            loadSampleMovies();
        } finally {
            hideLoading();
        }
    }

    // Load sample movies (fallback)
    function loadSampleMovies() {
        const sampleMovies = [
            { name: "The Shawshank Redemption", year: "1994", genre: "Drama", language: "English", reason: "Hope in darkness, meaningful story", mood: "sad", poster: "gradient-blue" },
            { name: "The Godfather", year: "1972", genre: "Crime/Drama", language: "English", reason: "Mafia family epic masterpiece", mood: "angry", poster: "gradient-black" },
            { name: "The Dark Knight", year: "2008", genre: "Action/Crime", language: "English", reason: "Superhero crime epic", mood: "action", poster: "gradient-black" },
            { name: "Pulp Fiction", year: "1994", genre: "Crime/Drama", language: "English", reason: "Non-linear crime anthology", mood: "surprise", poster: "gradient-yellow" },
            { name: "Forrest Gump", year: "1994", genre: "Drama/Comedy", language: "English", reason: "Feel-good classic with heartwarming moments", mood: "happy", poster: "gradient-green" },
            { name: "Inception", year: "2010", genre: "Sci-Fi/Thriller", language: "English", reason: "Mind-bending dream twists", mood: "surprise", poster: "gradient-black" },
            { name: "Fight Club", year: "1999", genre: "Drama/Thriller", language: "English", reason: "Subversive masculinity critique", mood: "angry", poster: "gradient-gray" },
            { name: "Goodfellas", year: "1990", genre: "Crime/Drama", language: "English", reason: "Gangster life rise and fall", mood: "action", poster: "gradient-red" },
            { name: "The Matrix", year: "1999", genre: "Action/Sci-Fi", language: "English", reason: "Reality simulation awakening", mood: "surprise", poster: "gradient-green" },
            { name: "Interstellar", year: "2014", genre: "Sci-Fi/Adventure", language: "English", reason: "Space exploration epic", mood: "tired", poster: "gradient-blue" },
            { name: "Parasite", year: "2019", genre: "Thriller/Dark Comedy", language: "Korean", reason: "Class struggle thriller with twists", mood: "surprise", poster: "gradient-gray" },
            { name: "Gladiator", year: "2000", genre: "Action/Drama", language: "English", reason: "Roman revenge epic", mood: "angry", poster: "gradient-brown" },
            { name: "Whiplash", year: "2014", genre: "Drama/Music", language: "English", reason: "Drummer perfection obsession", mood: "sad", poster: "gradient-red" },
            { name: "The Prestige", year: "2006", genre: "Drama/Mystery", language: "English", reason: "Magician rivalry obsession", mood: "surprise", poster: "gradient-black" },
            { name: "Django Unchained", year: "2012", genre: "Western/Action", language: "English", reason: "Revenge western - satisfying action", mood: "angry", poster: "gradient-brown" },
            { name: "Mad Max: Fury Road", year: "2015", genre: "Action/Adventure", language: "English", reason: "Post-apocalyptic chase", mood: "action", poster: "gradient-orange" },
            { name: "Blade Runner 2049", year: "2017", genre: "Sci-Fi/Noir", language: "English", reason: "Visual sci-fi detective story", mood: "tired", poster: "gradient-orange" },
            { name: "The Green Mile", year: "1999", genre: "Crime/Drama", language: "English", reason: "Death row supernatural drama", mood: "sad", poster: "gradient-green" },
            { name: "The Usual Suspects", year: "1995", genre: "Crime/Mystery", language: "English", reason: "Criminal mastermind mystery", mood: "surprise", poster: "gradient-gray" },
            { name: "La La Land", year: "2016", genre: "Musical/Romance", language: "English", reason: "Modern musical romance", mood: "love", poster: "gradient-pink" }
        ];

        sampleMovies.forEach(movie => {
            const movieWithPoster = addPosterUrl(movie);
            state.movies.push(movieWithPoster);
        });

        state.allMoviesLoaded = true;
        console.log(`Loaded ${state.movies.length} sample movies`);
    }

    // Add poster URL to movie
    function addPosterUrl(movie) {
        const posterMap = {
            'gradient-blue': 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=250&fit=crop',
            'gradient-green': 'https://images.unsplash.com/photo-1489599809516-9827b6d1cf13?w=400&h=250&fit=crop',
            'gradient-purple': 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=400&h=250&fit=crop',
            'gradient-orange': 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&h=250&fit=crop',
            'gradient-pink': 'https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=400&h=250&fit=crop',
            'gradient-red': 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=400&h=250&fit=crop',
            'gradient-yellow': 'https://images.unsplash.com/photo-1535016120720-40c646be5580?w=400&h=250&fit=crop',
            'gradient-gray': 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=250&fit=crop',
            'gradient-brown': 'https://images.unsplash.com/photo-1489599809516-9827b6d1cf13?w=400&h=250&fit=crop',
            'gradient-black': 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=250&fit=crop'
        };

        return {
            ...movie,
            poster: posterMap[movie.poster] || posterMap['gradient-blue'],
            id: `${movie.name.toLowerCase().replace(/\s+/g, '-')}-${movie.year}`,
            rating: (Math.random() * 1 + 4).toFixed(1) // Generate random rating
        };
    }

    // Load weekly viewed movies from localStorage
    function loadWeeklyViewed() {
        const weekNumber = getWeekNumber();
        const saved = localStorage.getItem(`moodmovie-weekly-${weekNumber}`);

        if (saved) {
            try {
                const data = JSON.parse(saved);
                state.weeklyViewed = new Set(data.viewed || []);
            } catch (e) {
                state.weeklyViewed = new Set();
            }
        }

        // Clear old data (older than 2 weeks)
        for (let i = 0; i < 4; i++) {
            const oldWeek = weekNumber - i - 2;
            localStorage.removeItem(`moodmovie-weekly-${oldWeek}`);
        }
    }

    // Get current week number
    function getWeekNumber() {
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 0);
        const diff = now - start;
        const oneWeek = 1000 * 60 * 60 * 24 * 7;
        return Math.floor(diff / oneWeek);
    }

    // Save weekly viewed movies
    function saveWeeklyViewed() {
        const weekNumber = getWeekNumber();
        const data = {
            week: weekNumber,
            viewed: Array.from(state.weeklyViewed)
        };
        localStorage.setItem(`moodmovie-weekly-${weekNumber}`, JSON.stringify(data));
    }

    // ENHANCED SMART ALGORITHM with new mood-to-genre mapping
    function getFilteredMoviesByMood(mood, count = 15) {
        // Mood to genre mapping according to requirements
        const moodToGenres = {
            'happy': ['Adventure', 'Comedy', 'Action'],
            'sad': ['Drama', 'Motivation', 'Inspirational'],
            'tired': ['Drama', 'Documentary', 'Slice of Life'],
            'angry': ['Action', 'Thriller', 'Crime'],
            'love': ['Romance', 'Drama'],
            'horror': ['Horror', 'Psychological', 'Thriller'],
            'action': ['Action', 'Crime', 'Thriller'],
            'surprise': [], // Will handle separately - random mix
            'light': ['Comedy', 'Family', 'Adventure'],
            'feelgood': ['Comedy', 'Drama', 'Family']
        };

        let filtered = [];

        // Special handling for surprise mode
        if (mood === 'surprise') {
            // Get random mix of movies from all moods
            const allMovies = shuffleArray([...state.movies]);
            filtered = allMovies.slice(0, count);

        } else if (mood === 'eating_comedy' || mood === 'eating_feelgood' || mood === 'eating_light_action') {
            // Handle eating modes (these come from quick picks)
            const eatingGenres = {
                'eating_comedy': ['Comedy', 'Family'],
                'eating_feelgood': ['Drama', 'Family'],
                'eating_light_action': ['Action', 'Adventure']
            };

            const genres = eatingGenres[mood] || ['Comedy', 'Family'];
            filtered = state.movies.filter(movie => {
                const movieGenres = movie.genre.split('/').map(g => g.trim().toLowerCase());
                return genres.some(genre =>
                    movieGenres.some(mg => mg.includes(genre.toLowerCase()))
                ) && !movie.genre.toLowerCase().includes('horror');
            });

        } else {
            // Get genres for this mood
            const targetGenres = moodToGenres[mood] || [];

            // Filter movies by matching genres
            filtered = state.movies.filter(movie => {
                const movieGenres = movie.genre.split('/').map(g => g.trim().toLowerCase());

                // Check if any movie genre matches target genres
                return targetGenres.some(targetGenre => {
                    const tg = targetGenre.toLowerCase().trim();

                    // Special handling for certain genre names
                    if (tg === 'motivation' || tg === 'inspirational') {
                        return movie.reason.toLowerCase().includes(tg) ||
                               movieGenres.some(mg => mg.includes('drama'));
                    }
                    if (tg === 'feelgood') {
                        return movie.mood === 'happy' ||
                               movie.reason.toLowerCase().includes('uplifting') ||
                               movie.reason.toLowerCase().includes('feel good');
                    }

                    // Regular genre matching
                    return movieGenres.some(mg => mg.includes(tg)) ||
                           movie.mood === mood ||
                           (tg === 'action' && (movieGenres.some(mg => mg.includes('adventure'))));
                });
            });
        }

        // If no movies found, try broader search
        if (filtered.length < 5 && mood !== 'surprise') {
            const fallbackMap = {
                'happy': ['Comedy', 'Drama'],
                'sad': ['Drama'],
                'tired': ['Drama'],
                'angry': ['Crime', 'Drama'],
                'love': ['Drama'],
                'horror': ['Thriller', 'Mystery'],
                'action': ['Adventure', 'Thriller'],
                'light': ['Comedy'],
                'feelgood': ['Drama']
            };

            const fallbackGenres = fallbackMap[mood] || [];
            filtered = state.movies.filter(movie => {
                const movieGenres = movie.genre.split('/').map(g => g.trim().toLowerCase());
                return fallbackGenres.some(genre =>
                    movieGenres.some(mg => mg.includes(genre.toLowerCase()))
                );
            });
        }

        // Remove duplicates by ID
        const uniqueMovies = [];
        const seenIds = new Set();

        filtered.forEach(movie => {
            if (!seenIds.has(movie.id)) {
                seenIds.add(movie.id);
                uniqueMovies.push(movie);
            }
        });

        // SMART SORTING ALGORITHM:
        // 1. Movies not viewed this week get priority
        // 2. Movies not viewed in current session next
        // 3. Sort by rating (higher first)
        // 4. Sort by year (newer first)
        // 5. Add some randomness for variety

        const sorted = uniqueMovies.sort((a, b) => {
            const aViewedThisWeek = state.weeklyViewed.has(a.id);
            const bViewedThisWeek = state.weeklyViewed.has(b.id);

            const aViewedSession = state.viewedMovies.has(a.id);
            const bViewedSession = state.viewedMovies.has(b.id);

            // Priority 1: Not viewed this week
            if (aViewedThisWeek !== bViewedThisWeek) {
                return aViewedThisWeek ? 1 : -1;
            }

            // Priority 2: Not viewed this session
            if (aViewedSession !== bViewedSession) {
                return aViewedSession ? 1 : -1;
            }

            // Priority 3: Higher rating
            const ratingDiff = parseFloat(b.rating) - parseFloat(a.rating);
            if (Math.abs(ratingDiff) > 0.3) return ratingDiff;

            // Priority 4: Newer movies
            const yearDiff = parseInt(b.year) - parseInt(a.year);
            if (Math.abs(yearDiff) > 5) return yearDiff;

            // Add some randomness for variety
            return Math.random() - 0.5;
        });

        // Take requested number of movies
        const result = sorted.slice(0, count);

        // Mark these movies as viewed for this session
        result.forEach(movie => {
            state.viewedMovies.add(movie.id);
        });

        // Add to quick pick history for better recommendations
        if (result.length > 0) {
            state.quickPickHistory.push({
                mood: mood,
                movies: result.map(m => m.id),
                timestamp: Date.now()
            });

            // Keep only last 20 quick picks
            if (state.quickPickHistory.length > 20) {
                state.quickPickHistory.shift();
            }
        }

        return result;
    }

    // Helper function to shuffle array
    function shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    // Setup all event listeners
    function setupEventListeners() {
        // Theme toggle
        elements.themeToggle.addEventListener('click', toggleTheme);

        // Language toggle
        elements.langButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const lang = btn.dataset.lang;
                updateLanguage(lang);
            });
        });

        // Quick pick buttons
        elements.quickButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const mood = btn.dataset.mood;
                handleQuickPick(mood);
            });
        });

        // Surprise me button
        elements.surpriseBtn.addEventListener('click', handleSurpriseMe);

        // Eating mode button
        elements.eatingBtn.addEventListener('click', handleEatingMode);

        // Shuffle button
        elements.shuffleBtn.addEventListener('click', shuffleMovies);

        // Back button
        elements.backBtn.addEventListener('click', resetToMoodSelection);

        // Eating option buttons
        elements.eatingButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const type = btn.dataset.type;
                handleEatingType(type);
            });
        });

        // Install button
        if (elements.installBtn) {
            elements.installBtn.addEventListener('click', installPWA);
        }

        // View more button (if exists)
        const viewMoreBtn = document.getElementById('viewMoreBtn');
        if (viewMoreBtn) {
            viewMoreBtn.addEventListener('click', loadMoreMovies);
        }
    }

    // Setup auto mood timer
    function setupAutoMoodTimer() {
        clearInterval(state.autoTimerInterval);
        state.timerCount = 3;
        elements.autoMoodTimer.textContent = state.timerCount;

        if (!state.currentMood && !state.isEatingMode) {
            state.autoTimerInterval = setInterval(() => {
                state.timerCount--;
                elements.autoMoodTimer.textContent = state.timerCount > 0 ? state.timerCount : "0";

                if (state.timerCount <= 0) {
                    clearInterval(state.autoTimerInterval);
                    handleTimeBasedAutoMood();
                }
            }, 1000);
        } else {
            elements.autoMoodTimer.textContent = "—";
        }
    }

    // Handle time-based auto mood
    function handleTimeBasedAutoMood() {
        const hour = new Date().getHours();
        let mood, reason;

        if (hour >= 5 && hour < 12) {
            mood = "happy";
            reason = state.currentLanguage === 'en'
                ? "🌅 Good morning! Enjoy light motivational movies"
                : "🌅 காலை வணக்கம்! லேசான உந்துதல் திரைப்படங்களை அனுபவியுங்கள்";
        } else if (hour >= 12 && hour < 17) {
            mood = "action";
            reason = state.currentLanguage === 'en'
                ? "☀️ Good afternoon! Perfect for action and entertainment"
                : "☀️ மதியம் வணக்கம்! நடவடிக்கை மற்றும் பொழுதுபோக்கிற்கு சிறந்தது";
        } else if (hour >= 17 && hour < 22) {
            mood = "tired";
            reason = state.currentLanguage === 'en'
                ? "🌇 Evening time! Enjoy relaxing entertainment"
                : "🌇 மாலை நேரம்! ஓய்வு பெறும் பொழுதுபோக்கை அனுபவிக்கவும்";
        } else {
            mood = "surprise";
            reason = state.currentLanguage === 'en'
                ? "🌙 Good night! Time for thrilling entertainment"
                : "🌙 இரவு வணக்கம்! த்ரில்லிங் பொழுதுபோக்கிற்கு நேரம்";
        }

        showNotification(reason);
        filterMoviesByMood(mood);
    }

    // Render mood buttons with new moods
    function renderMoodButtons() {
        const moods = [
            { id: 'happy', icon: 'fas fa-laugh', en: 'Happy', ta: 'மகிழ்ச்சி' },
            { id: 'sad', icon: 'fas fa-frown', en: 'Sad', ta: 'சோகம்' },
            { id: 'tired', icon: 'fas fa-bed', en: 'Tired', ta: 'சோர்வு' },
            { id: 'angry', icon: 'fas fa-angry', en: 'Angry', ta: 'கோபம்' },
            { id: 'love', icon: 'fas fa-heart', en: 'Love', ta: 'காதல்' },
            { id: 'horror', icon: 'fas fa-ghost', en: 'Horror', ta: 'பயங்கரம்' },
            { id: 'action', icon: 'fas fa-explosion', en: 'Action', ta: 'நடவடிக்கை' },
            { id: 'surprise', icon: 'fas fa-gift', en: 'Surprise', ta: 'ஆச்சரியம்' }
        ];

        elements.moodGrid.innerHTML = '';

        moods.forEach(mood => {
            const button = document.createElement('button');
            button.className = 'mood-btn';
            button.dataset.mood = mood.id;

            button.innerHTML = `
                <i class="${mood.icon}"></i>
                <span class="english-text">${mood.en}</span>
                <span class="tamil-text">${mood.ta}</span>
            `;

            button.addEventListener('click', () => {
                handleMoodSelection(mood.id);
            });

            elements.moodGrid.appendChild(button);
        });
    }

    // Handle mood selection
    function handleMoodSelection(mood) {
        state.currentMood = mood;
        state.isEatingMode = false;
        elements.eatingOptions.style.display = 'none';
        clearInterval(state.autoTimerInterval);
        elements.autoMoodTimer.textContent = "—";
        filterMoviesByMood(mood);
        playNotificationSound();
    }

    // Filter movies by mood
    function filterMoviesByMood(mood) {
        if (state.movies.length === 0) {
            showNotification(state.currentLanguage === 'en'
                ? 'Loading movies...'
                : 'திரைப்படங்கள் ஏற்றப்படுகின்றன...');
            return;
        }

        state.filteredMovies = getFilteredMoviesByMood(mood);
        renderMovies();

        // Update title
        const moodTitles = {
            'happy': { en: '😀 Happy Movies', ta: '😀 மகிழ்ச்சியான திரைப்படங்கள்' },
            'sad': { en: '😔 Sad Movies', ta: '😔 சோக திரைப்படங்கள்' },
            'tired': { en: '😴 Relaxing Movies', ta: '😴 ஓய்வு திரைப்படங்கள்' },
            'angry': { en: '😡 Angry Movies', ta: '😡 கோப திரைப்படங்கள்' },
            'love': { en: '❤️ Love Movies', ta: '❤️ காதல் திரைப்படங்கள்' },
            'horror': { en: '👻 Horror Movies', ta: '👻 பயங்கர திரைப்படங்கள்' },
            'action': { en: '💥 Action Movies', ta: '💥 நடவடிக்கை திரைப்படங்கள்' },
            'light': { en: '😂 Light Fun Movies', ta: '😂 லேசான வேடிக்கை திரைப்படங்கள்' },
            'surprise': { en: '🎲 Surprise Movies', ta: '🎲 ஆச்சரிய திரைப்படங்கள்' },
            'feelgood': { en: '✨ Feel Good Movies', ta: '✨ நன்றாக உணருங்கள் திரைப்படங்கள்' }
        };

        const title = moodTitles[mood] || { en: `${mood} Movies`, ta: `${mood} திரைப்படங்கள்` };
        elements.currentMoodTitle.textContent = state.currentLanguage === 'en' ? title.en : title.ta;
    }

    // Handle quick pick
    function handleQuickPick(type) {
        let mood;
        switch(type) {
            case 'light':
                mood = 'light';
                break;
            case 'popular':
                showPopularMovies();
                return;
            case 'feelgood':
                mood = 'feelgood';
                break;
            default:
                mood = type;
        }
        handleMoodSelection(mood);
    }

    // Show popular movies
    function showPopularMovies() {
        clearInterval(state.autoTimerInterval);
        elements.autoMoodTimer.textContent = "—";
        playNotificationSound();

        // Get popular movies based on rating and year
        const popular = [...state.movies]
            .sort((a, b) => {
                // Higher rating first
                const ratingDiff = parseFloat(b.rating) - parseFloat(a.rating);
                if (Math.abs(ratingDiff) > 0.5) return ratingDiff;

                // Newer movies next
                const yearDiff = parseInt(b.year) - parseInt(a.year);
                return yearDiff;
            })
            .slice(0, 12);

        state.filteredMovies = popular;
        renderMovies();

        elements.currentMoodTitle.textContent = state.currentLanguage === 'en'
            ? '🔥 Popular Movies'
            : '🔥 பிரபலமான திரைப்படங்கள்';
    }

    // Handle surprise me
    function handleSurpriseMe() {
        clearInterval(state.autoTimerInterval);
        elements.autoMoodTimer.textContent = "—";
        playNotificationSound();

        showLoading();

        setTimeout(() => {
            // Pick random mood
            const moods = ['happy', 'sad', 'tired', 'angry', 'love', 'horror', 'action'];
            const randomMood = moods[Math.floor(Math.random() * moods.length)];

            // Get movies for that mood
            const movies = getFilteredMoviesByMood(randomMood, 3);

            if (movies.length > 0) {
                state.filteredMovies = movies;
                renderMovies();

                const moodTitles = {
                    'happy': { en: '🎲 Surprise Happy Picks!', ta: '🎲 ஆச்சரிய மகிழ்ச்சி தேர்வுகள்!' },
                    'sad': { en: '🎲 Surprise Emotional Picks!', ta: '🎲 ஆச்சரிய உணர்ச்சி தேர்வுகள்!' },
                    'tired': { en: '🎲 Surprise Relaxing Picks!', ta: '🎲 ஆச்சரிய ஓய்வு தேர்வுகள்!' },
                    'angry': { en: '🎲 Surprise Action Picks!', ta: '🎲 ஆச்சரிய நடவடிக்கை தேர்வுகள்!' },
                    'love': { en: '🎲 Surprise Love Picks!', ta: '🎲 ஆச்சரிய காதல் தேர்வுகள்!' },
                    'horror': { en: '🎲 Surprise Horror Picks!', ta: '🎲 ஆச்சரிய பயங்கர தேர்வுகள்!' },
                    'action': { en: '🎲 Surprise Action Picks!', ta: '🎲 ஆச்சரிய நடவடிக்கை தேர்வுகள்!' }
                };

                elements.currentMoodTitle.textContent = state.currentLanguage === 'en'
                    ? moodTitles[randomMood].en
                    : moodTitles[randomMood].ta;
            }

            hideLoading();
        }, 1000);
    }

    // Handle eating mode
    function handleEatingMode() {
        state.isEatingMode = true;
        state.currentMood = null;
        clearInterval(state.autoTimerInterval);
        elements.autoMoodTimer.textContent = "—";
        playNotificationSound();

        elements.eatingOptions.style.display = 'block';
        elements.eatingOptions.scrollIntoView({ behavior: 'smooth' });

        elements.movieGrid.innerHTML = `
            <div class="no-movies">
                <i class="fas fa-utensils"></i>
                <p>${state.currentLanguage === 'en'
                    ? 'Choose your eating style below'
                    : 'கீழே உங்கள் சாப்பிடும் பாணியைத் தேர்ந்தெடுக்கவும்'}</p>
            </div>
        `;

        elements.currentMoodTitle.textContent = state.currentLanguage === 'en'
            ? '🍽️ Eating Mode - Choose Style'
            : '🍽️ சாப்பிடும் முறை - பாணியைத் தேர்ந்தெடுக்கவும்';
    }

    // Handle eating type selection
    function handleEatingType(type) {
        state.eatingType = type;
        playNotificationSound();

        let filtered = [];
        const category = `eating_${type}`;

        // Filter movies for eating mode
        filtered = state.movies.filter(movie => {
            const heavyGenres = ['Horror', 'Thriller', 'Tragedy', 'Violent'];
            const hasHeavyGenre = heavyGenres.some(genre =>
                movie.genre.toLowerCase().includes(genre.toLowerCase())
            );

            if (hasHeavyGenre) return false;

            switch(type) {
                case 'comedy':
                    return movie.genre.toLowerCase().includes('comedy') ||
                           movie.genre.toLowerCase().includes('family');
                case 'feelgood':
                    return movie.mood === 'happy' ||
                           movie.mood === 'love' ||
                           movie.reason.toLowerCase().includes('feel good');
                case 'light':
                    return movie.genre.toLowerCase().includes('action') ||
                           movie.genre.toLowerCase().includes('adventure') ||
                           movie.genre.toLowerCase().includes('comedy');
                default:
                    return true;
            }
        }).slice(0, 12);

        // Apply smart filtering
        const uniqueMovies = [];
        const seenIds = new Set();

        filtered.forEach(movie => {
            if (!seenIds.has(movie.id) && !state.weeklyViewed.has(movie.id)) {
                seenIds.add(movie.id);
                uniqueMovies.push(movie);
            }
        });

        state.filteredMovies = uniqueMovies.slice(0, 12);
        renderMovies();

        // Mark as viewed for session
        state.filteredMovies.forEach(movie => {
            state.viewedMovies.add(movie.id);
        });

        const typeNames = {
            comedy: { en: 'Comedy', ta: 'காமெடி' },
            feelgood: { en: 'Feel Good', ta: 'நன்றாக உணருங்கள்' },
            light: { en: 'Light Action', ta: 'ஒளி நடவடிக்கை' }
        };

        elements.currentMoodTitle.textContent = state.currentLanguage === 'en'
            ? `🍽️ Eating Mode - ${typeNames[type].en}`
            : `🍽️ சாப்பிடும் முறை - ${typeNames[type].ta}`;

        elements.eatingOptions.style.display = 'none';
    }

    // Shuffle movies (SMART SHUFFLE)
    function shuffleMovies() {
        if (state.filteredMovies.length > 0) {
            playNotificationSound();

            // Get current mood
            const currentMood = state.currentMood ||
                               (state.isEatingMode ? state.eatingType : 'popular');

            // Get new movies (avoiding recently viewed)
            const newMovies = getFilteredMoviesByMood(currentMood, state.filteredMovies.length);

            if (newMovies.length > 0) {
                state.filteredMovies = newMovies;
                renderMovies();

                showNotification(state.currentLanguage === 'en'
                    ? '🎲 Shuffled with fresh picks!'
                    : '🎲 புதிய தேர்வுகளுடன் குழப்பப்பட்டது!');
            } else {
                // If no new movies, just shuffle existing ones
                state.filteredMovies = shuffleArray([...state.filteredMovies]);
                renderMovies();

                showNotification(state.currentLanguage === 'en'
                    ? '🎲 Movies shuffled!'
                    : '🎲 திரைப்படங்கள் குழப்பப்பட்டன!');
            }
        }
    }

    // Load more movies
    function loadMoreMovies() {
        if (!state.currentMood) return;

        const currentCount = state.filteredMovies.length;
        const moreMovies = getFilteredMoviesByMood(state.currentMood, currentCount + 6);

        if (moreMovies.length > currentCount) {
            state.filteredMovies = moreMovies;
            renderMovies();

            showNotification(state.currentLanguage === 'en'
                ? `➕ Loaded ${moreMovies.length - currentCount} more movies`
                : `➕ ${moreMovies.length - currentCount} மேலும் திரைப்படங்கள் ஏற்றப்பட்டன`);
        } else {
            showNotification(state.currentLanguage === 'en'
                ? '✅ No more movies to load'
                : '✅ ஏற்ற வேறு திரைப்படங்கள் இல்லை');
        }
    }

    // Render movies to the grid
    function renderMovies() {
        if (!state.filteredMovies || state.filteredMovies.length === 0) {
            elements.movieGrid.innerHTML = `
                <div class="no-movies">
                    <i class="fas fa-film"></i>
                    <p>${state.currentLanguage === 'en'
                        ? 'No movies found for this selection'
                        : 'இந்த தேர்வுக்கு திரைப்படங்கள் இல்லை'}</p>
                </div>
            `;
            return;
        }

        elements.movieGrid.innerHTML = '';

        state.filteredMovies.forEach(movie => {
            const card = createMovieCard(movie);
            elements.movieGrid.appendChild(card);
        });

        // Mark as weekly viewed
        state.filteredMovies.forEach(movie => {
            state.weeklyViewed.add(movie.id);
        });
        saveWeeklyViewed();

        // Show view more button if there are more movies
        const viewMoreBtn = document.getElementById('viewMoreBtn');
        if (viewMoreBtn) {
            const totalForMood = state.movies.filter(m =>
                m.mood === state.currentMood ||
                getFilteredMoviesByMood(state.currentMood, 1000).some(fm => fm.id === m.id)
            ).length;

            if (totalForMood > state.filteredMovies.length) {
                viewMoreBtn.style.display = 'flex';
            } else {
                viewMoreBtn.style.display = 'none';
            }
        }

        // Scroll to movie display
        document.querySelector('.movie-display').scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }

    // Create a movie card element (keeping your original card design)
    function createMovieCard(movie) {
        const card = document.createElement('div');
        card.className = 'movie-card';

        // Check if viewed this week
        const isViewedThisWeek = state.weeklyViewed.has(movie.id);

        // Genre to gradient mapping
        const genreGradients = {
            'Drama': 'gradient-blue',
            'Comedy': 'gradient-yellow',
            'Action': 'gradient-red',
            'Romance': 'gradient-pink',
            'Animation': 'gradient-purple',
            'Thriller': 'gradient-gray',
            'Adventure': 'gradient-orange',
            'Biography': 'gradient-green',
            'Family': 'gradient-blue',
            'Musical': 'gradient-pink',
            'Sci-Fi': 'gradient-purple',
            'Horror': 'gradient-red',
            'Crime': 'gradient-gray',
            'Fantasy': 'gradient-orange',
            'War': 'gradient-black',
            'Documentary': 'gradient-green',
            'History': 'gradient-brown',
            'Mystery': 'gradient-gray',
            'Sport': 'gradient-red'
        };

        const firstGenre = movie.genre.split('/')[0].split(',')[0].trim();
        const gradientClass = genreGradients[firstGenre] || 'gradient-blue';

        // Mood to class mapping
        const moodClasses = {
            'happy': 'mood-happy',
            'sad': 'mood-sad',
            'tired': 'mood-tired',
            'angry': 'mood-angry',
            'love': 'mood-romantic',
            'horror': 'mood-horror',
            'action': 'mood-action',
            'surprise': 'mood-surprise'
        };

        const moodClass = moodClasses[movie.mood] || 'mood-happy';

        // Mood to icon mapping
        const moodIcons = {
            'happy': 'fa-laugh-beam',
            'sad': 'fa-frown',
            'tired': 'fa-bed',
            'angry': 'fa-angry',
            'love': 'fa-heart',
            'horror': 'fa-ghost',
            'action': 'fa-explosion',
            'surprise': 'fa-gift'
        };

        // Genre to icon mapping
        const genreIcons = {
            'Drama': 'fa-theater-masks',
            'Comedy': 'fa-laugh',
            'Action': 'fa-explosion',
            'Romance': 'fa-heart',
            'Animation': 'fa-film',
            'Thriller': 'fa-mask',
            'Adventure': 'fa-mountain',
            'Biography': 'fa-user',
            'Family': 'fa-home',
            'Musical': 'fa-music',
            'Sci-Fi': 'fa-rocket',
            'Horror': 'fa-ghost',
            'Crime': 'fa-user-secret',
            'Fantasy': 'fa-dragon',
            'War': 'fa-fist-raised',
            'Documentary': 'fa-camera',
            'History': 'fa-landmark',
            'Mystery': 'fa-search',
            'Sport': 'fa-running'
        };

        const genreIcon = genreIcons[firstGenre] || 'fa-film';

        // Generate stars HTML
        const rating = parseFloat(movie.rating) || 4.0;
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        let starsHTML = '';

        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                starsHTML += '<i class="fas fa-star star"></i>';
            } else if (i === fullStars && hasHalfStar) {
                starsHTML += '<i class="fas fa-star-half-alt star"></i>';
            } else {
                starsHTML += '<i class="far fa-star star empty"></i>';
            }
        }

        // Check if movie is featured (based on rating)
        const isFeatured = rating >= 4.5;

        // Generate random view count (in thousands)
        const views = Math.floor(Math.random() * 900 + 100) + 'K';

        // Generate random duration (90-180 minutes)
        const duration = Math.floor(Math.random() * 90 + 90) + ' min';

        // Generate random release month
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const releaseMonth = months[Math.floor(Math.random() * months.length)];

        card.innerHTML = `
            <div class="movie-header ${gradientClass}">
                <!-- Film Strip Decorations -->
                <div class="film-strip top"></div>
                <div class="film-strip bottom"></div>

                <!-- Movie Icon -->
                <div class="movie-icon">
                    <i class="fas ${genreIcon}"></i>
                </div>

                <!-- Year Badge -->
                <div class="year-badge">${movie.year}</div>

                <!-- Viewed This Week Badge -->
                ${isViewedThisWeek ? '<div class="featured-badge" style="background: linear-gradient(135deg, #3b82f6, #1d4ed8);">📺 Viewed</div>' : ''}

                <!-- Featured Badge (if featured) -->
                ${isFeatured && !isViewedThisWeek ? '<div class="featured-badge">⭐ ${rating}/5.0</div>' : ''}
            </div>

            <div class="movie-content">
                <!-- Movie Title -->
                <h4 class="movie-title">${movie.name}</h4>

                <!-- Movie Tags -->
                <div class="movie-tags">
                    <span class="tag language-tag">
                        <i class="fas fa-globe"></i> ${movie.language}
                    </span>
                    <span class="tag genre-tag">
                        <i class="fas ${genreIcon}"></i> ${firstGenre}
                    </span>
                    <span class="tag release-tag">
                        <i class="fas fa-calendar"></i> ${releaseMonth} ${movie.year}
                    </span>
                </div>

                <!-- Rating -->
                <div class="rating">
                    ${starsHTML}
                    <span style="margin-left: 8px; font-size: 0.9rem; color: var(--text-secondary);">
                        ${rating.toFixed(1)}/5.0
                    </span>
                </div>

                <!-- Movie Stats -->
                <div class="movie-stats">
                    <div class="stat-item">
                        <span class="stat-value">${views}</span>
                        <span class="stat-label">Views</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">${duration}</span>
                        <span class="stat-label">Duration</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">${movie.year}</span>
                        <span class="stat-label">Year</span>
                    </div>
                </div>

                <!-- Movie Mood -->
                <div class="movie-mood ${moodClass}">
                    <i class="fas ${moodIcons[movie.mood] || 'fa-film'}"></i>
                    <span>${movie.mood ? movie.mood.charAt(0).toUpperCase() + movie.mood.slice(1) : 'Movie'}</span>
                </div>

                <!-- Movie Description -->
                <p class="movie-desc">
                    <i class="fas fa-lightbulb" style="color: var(--accent-color); margin-right: 8px;"></i>
                    ${movie.reason}
                </p>

                <!-- Action Buttons -->
                <div class="movie-actions">
                    <button class="action-btn watch-btn" data-movie-id="${movie.id}">
                        <i class="fas fa-play-circle"></i>
                        ${state.currentLanguage === 'en' ? 'Watch Now' : 'இப்போது பாருங்கள்'}
                    </button>
                    <button class="action-btn bookmark-btn" data-movie-id="${movie.id}">
                        <i class="fas fa-bookmark"></i>
                        ${state.currentLanguage === 'en' ? 'Save' : 'சேமிக்கவும்'}
                    </button>
                </div>
            </div>
        `;

        // Watch button click
        card.querySelector('.watch-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            playNotificationSound();

            const platforms = ['Netflix', 'Amazon Prime', 'Hotstar', 'YouTube', 'Disney+'];
            const platform = platforms[Math.floor(Math.random() * platforms.length)];

            showNotification(state.currentLanguage === 'en'
                ? `🎬 Now playing "${movie.name}" on ${platform}`
                : `🎬 ${platform} இல் "${movie.name}" இப்போது இயங்குகிறது`);

            // Mark as watched
            state.weeklyViewed.add(movie.id);
            saveWeeklyViewed();
        });

        // Bookmark button click
        card.querySelector('.bookmark-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            playNotificationSound();

            const btn = e.target.closest('.bookmark-btn');
            const icon = btn.querySelector('i');

            if (icon.classList.contains('fa-bookmark')) {
                icon.className = 'fas fa-check';
                btn.innerHTML = `<i class="fas fa-check"></i> ${state.currentLanguage === 'en' ? 'Saved!' : 'சேமிக்கப்பட்டது!'}`;
                showNotification(state.currentLanguage === 'en'
                    ? `✅ "${movie.name}" added to your watchlist`
                    : `✅ "${movie.name}" உங்கள் பார்க்கும் பட்டியலில் சேர்க்கப்பட்டது`);
            } else {
                icon.className = 'fas fa-bookmark';
                btn.innerHTML = `<i class="fas fa-bookmark"></i> ${state.currentLanguage === 'en' ? 'Save' : 'சேமிக்கவும்'}`;
                showNotification(state.currentLanguage === 'en'
                    ? `📌 "${movie.name}" removed from watchlist`
                    : `📌 "${movie.name}" பார்க்கும் பட்டியலிலிருந்து நீக்கப்பட்டது`);
            }
        });

        // Card click (for quick view)
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.action-btn')) {
                playNotificationSound();
                showMovieDetails(movie, gradientClass, genreIcon);
            }
        });

        return card;
    }

    // Show movie details modal (keeping your original modal design)
    function showMovieDetails(movie, gradientClass, genreIcon) {
        const modalHTML = `
            <div class="movie-modal" style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 99999;
                backdrop-filter: blur(10px);
            ">
                <div style="
                    background: var(--bg-card);
                    border-radius: 20px;
                    padding: 30px;
                    max-width: 500px;
                    width: 90%;
                    max-height: 80vh;
                    overflow-y: auto;
                    box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
                    border: 1px solid rgba(255,255,255,0.1);
                ">
                    <div style="
                        background: ${gradientClass === 'gradient-blue' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' :
                          gradientClass === 'gradient-green' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' :
                          gradientClass === 'gradient-purple' ? 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' :
                          gradientClass === 'gradient-orange' ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' :
                          gradientClass === 'gradient-pink' ? 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)' :
                          gradientClass === 'gradient-red' ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' :
                          gradientClass === 'gradient-yellow' ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)' :
                          gradientClass === 'gradient-gray' ? 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)' :
                          gradientClass === 'gradient-brown' ? 'linear-gradient(135deg, #92400e 0%, #78350f 100%)' :
                          gradientClass === 'gradient-black' ? 'linear-gradient(135deg, #000000 0%, #1f2937 100%)' :
                          'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
                        height: 150px;
                        border-radius: 15px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        margin-bottom: 20px;
                        position: relative;
                    ">
                        <i class="fas ${genreIcon}" style="font-size: 4rem; color: white;"></i>
                        <div style="
                            position: absolute;
                            top: 15px;
                            right: 15px;
                            background: rgba(0,0,0,0.7);
                            color: white;
                            padding: 5px 15px;
                            border-radius: 20px;
                            font-weight: 600;
                        ">${movie.year}</div>
                    </div>

                    <h3 style="
                        font-size: 1.5rem;
                        font-weight: 700;
                        margin-bottom: 15px;
                        color: var(--text-primary);
                    ">${movie.name}</h3>

                    <div style="
                        display: flex;
                        gap: 10px;
                        margin-bottom: 20px;
                        flex-wrap: wrap;
                    ">
                        <span style="
                            background: rgba(107, 114, 128, 0.2);
                            padding: 5px 15px;
                            border-radius: 20px;
                            font-size: 0.9rem;
                        ">
                            <i class="fas fa-globe"></i> ${movie.language}
                        </span>
                        <span style="
                            background: rgba(109, 40, 217, 0.2);
                            padding: 5px 15px;
                            border-radius: 20px;
                            font-size: 0.9rem;
                            color: var(--primary-color);
                        ">
                            <i class="fas fa-tags"></i> ${movie.genre}
                        </span>
                        <span style="
                            background: rgba(16, 185, 129, 0.2);
                            padding: 5px 15px;
                            border-radius: 20px;
                            font-size: 0.9rem;
                            color: #10b981;
                        ">
                            <i class="fas ${movie.mood === 'happy' ? 'fa-laugh' :
                                          movie.mood === 'sad' ? 'fa-frown' :
                                          movie.mood === 'tired' ? 'fa-bed' :
                                          movie.mood === 'angry' ? 'fa-angry' :
                                          movie.mood === 'love' ? 'fa-heart' :
                                          movie.mood === 'horror' ? 'fa-ghost' :
                                          movie.mood === 'action' ? 'fa-explosion' : 'fa-gift'}"></i>
                            ${movie.mood.charAt(0).toUpperCase() + movie.mood.slice(1)}
                        </span>
                    </div>

                    <div style="
                        background: var(--bg-secondary);
                        padding: 20px;
                        border-radius: 15px;
                        margin-bottom: 20px;
                    ">
                        <p style="
                            color: var(--text-secondary);
                            line-height: 1.6;
                            margin: 0;
                        ">
                            <i class="fas fa-info-circle" style="color: var(--accent-color); margin-right: 10px;"></i>
                            ${movie.reason}
                        </p>
                    </div>

                    <div style="
                        display: flex;
                        gap: 10px;
                    ">
                        <button class="close-modal-btn" style="
                            flex: 1;
                            padding: 15px;
                            background: var(--bg-secondary);
                            border: none;
                            border-radius: 10px;
                            color: var(--text-primary);
                            font-weight: 600;
                            cursor: pointer;
                        ">
                            <i class="fas fa-times"></i> ${state.currentLanguage === 'en' ? 'Close' : 'மூடு'}
                        </button>
                        <button class="watch-trailer-btn" style="
                            flex: 2;
                            padding: 15px;
                            background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
                            border: none;
                            border-radius: 10px;
                            color: white;
                            font-weight: 600;
                            cursor: pointer;
                        ">
                            <i class="fas fa-play"></i> ${state.currentLanguage === 'en' ? 'Watch Trailer' : 'டிரெய்லர் பார்க்க'}
                        </button>
                    </div>
                </div>
            </div>
        `;

        const modal = document.createElement('div');
        modal.innerHTML = modalHTML;
        document.body.appendChild(modal);

        // Close modal when clicking outside or close button
        modal.addEventListener('click', (e) => {
            if (e.target.classList.contains('movie-modal') || e.target.classList.contains('close-modal-btn')) {
                modal.remove();
            }
        });

        // Watch trailer button
        modal.querySelector('.watch-trailer-btn').addEventListener('click', () => {
            const query = encodeURIComponent(`${movie.name} ${movie.year} movie trailer`);
            window.open(`https://www.youtube.com/results?search_query=${query}`, '_blank');
            modal.remove();
        });
    }

    // Reset to mood selection
    function resetToMoodSelection() {
        state.currentMood = null;
        state.filteredMovies = [];
        state.isEatingMode = false;
        elements.eatingOptions.style.display = 'none';
        renderMovies();

        updateLanguage(state.currentLanguage);

        setupAutoMoodTimer();
        playNotificationSound();
    }

    // Toggle theme
    function toggleTheme() {
        state.currentTheme = state.currentTheme === 'light' ? 'dark' : 'light';
        applyTheme(state.currentTheme);
        playNotificationSound();
        showNotification(state.currentLanguage === 'en'
            ? `Switched to ${state.currentTheme} mode`
            : `${state.currentTheme === 'dark' ? 'இருள்' : 'ஒளி'} முறைக்கு மாற்றப்பட்டது`);
    }

    // Apply theme
    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('moodmovie-theme', theme);

        const icon = elements.themeToggle.querySelector('i');
        if (theme === 'dark') {
            icon.className = 'fas fa-sun';
        } else {
            icon.className = 'fas fa-moon';
        }
    }

    // Update language
    function updateLanguage(lang) {
        state.currentLanguage = lang;

        elements.langButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === lang);
        });

        document.querySelectorAll('[data-en]').forEach(element => {
            if (lang === 'en') {
                element.textContent = element.dataset.en;
            } else {
                element.textContent = element.dataset.ta;
            }
        });

        playNotificationSound();
        localStorage.setItem('moodmovie-language', lang);

        if (state.filteredMovies.length > 0) {
            renderMovies();
        }
    }

    // Show loading overlay
    function showLoading() {
        elements.loadingOverlay.style.display = 'flex';
    }

    // Hide loading overlay
    function hideLoading() {
        elements.loadingOverlay.style.display = 'none';
    }

    // Play notification sound
    function playNotificationSound() {
        if (elements.notificationSound) {
            elements.notificationSound.currentTime = 0;
            elements.notificationSound.play().catch(e => console.log('Audio play failed:', e));
        }
    }

    // Show notification
    function showNotification(message) {
        document.querySelectorAll('.notification').forEach(n => n.remove());

        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerHTML = `
            <i class="fas fa-info-circle"></i>
            ${message}
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // PWA Installation
    function setupPWAInstall() {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            state.deferredPrompt = e;

            if (elements.installBtn) {
                elements.installBtn.style.display = 'flex';
            }
        });

        window.addEventListener('appinstalled', () => {
            state.deferredPrompt = null;
            if (elements.installBtn) {
                elements.installBtn.style.display = 'none';
            }
            showNotification(state.currentLanguage === 'en'
                ? '✅ MoodMovie installed successfully!'
                : '✅ மூட்மூவி வெற்றிகரமாக நிறுவப்பட்டது!');
        });
    }

    // Install PWA
    function installPWA() {
        if (!state.deferredPrompt) {
            showNotification(state.currentLanguage === 'en'
                ? 'App is already installed or not supported'
                : 'பயன்பாடு ஏற்கனவே நிறுவப்பட்டுள்ளது அல்லது ஆதரிக்கப்படவில்லை');
            return;
        }

        state.deferredPrompt.prompt();

        state.deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the install prompt');
            }
            state.deferredPrompt = null;

            if (elements.installBtn) {
                elements.installBtn.style.display = 'none';
            }
        });
    }

    // Check if app is installed
    function checkIfInstalled() {
        if (window.matchMedia('(display-mode: standalone)').matches ||
            window.navigator.standalone === true) {
            if (elements.installBtn) {
                elements.installBtn.style.display = 'none';
            }
        }
    }

    // Initialize Service Worker for PWA
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('service-worker.js')
                .then(registration => {
                    console.log('ServiceWorker registered');
                })
                .catch(err => {
                    console.log('ServiceWorker registration failed: ', err);
                });
        });
    }

    // Handle offline/online status
    window.addEventListener('online', () => {
        showNotification(state.currentLanguage === 'en'
            ? '✅ You are back online!'
            : '✅ நீங்கள் மீண்டும் ஆன்லைனில் உள்ளீர்கள்!');
    });

    window.addEventListener('offline', () => {
        showNotification(state.currentLanguage === 'en'
            ? '📶 You are offline. App is working in offline mode.'
            : '📶 நீங்கள் ஆஃப்லைனில் உள்ளீர்கள். ஆப் ஆஃப்லைன் முறையில் செயல்படுகிறது.');
    });

    // Initialize the app
    initApp();
});