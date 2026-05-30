import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export const openDB = async () => {
  return open({
    filename: './database.sqlite',
    driver: sqlite3.Database
  });
};

export const initDB = async () => {
  const db = await openDB();
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      username TEXT NOT NULL,
      avatar_url TEXT,
      bio TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS movies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      genre TEXT NOT NULL,
      year INTEGER NOT NULL,
      description TEXT,
      poster_url TEXT,
      avg_rating REAL DEFAULT 0,
      ratings_count INTEGER DEFAULT 0
    );
    
    CREATE TABLE IF NOT EXISTS user_ratings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      movie_id INTEGER NOT NULL,
      rating INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (movie_id) REFERENCES movies(id),
      UNIQUE(user_id, movie_id)
    );
    
    CREATE TABLE IF NOT EXISTS friendships (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      friend_id INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (friend_id) REFERENCES users(id),
      UNIQUE(user_id, friend_id)
    );
    
    CREATE TABLE IF NOT EXISTS friend_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      from_user_id INTEGER NOT NULL,
      to_user_id INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME,
      FOREIGN KEY (from_user_id) REFERENCES users(id),
      FOREIGN KEY (to_user_id) REFERENCES users(id),
      UNIQUE(from_user_id, to_user_id)
    );
  `);
  
  // Тестовые фильмы
  const movies = await db.all('SELECT * FROM movies');
  if (movies.length === 0) {
    await db.exec(`
      INSERT INTO movies (title, genre, year, description) VALUES
      ('Побег из Шоушенка', 'Драма', 1994, 'Два заключённых находят дружбу и искупление за десятилетия проведённые в стенах тюрьмы.'),
      ('Крёстный отец', 'Драма', 1972, 'Глава мафиозной семьи передаёт власть младшему сыну в эпоху перемен.'),
      ('Тёмный рыцарь', 'Экшн', 2008, 'Бэтмен сражается с Джокером, который сеет хаос в Готэме.'),
      ('Криминальное чтиво', 'Криминал', 1994, 'Переплетающиеся истории двух киллеров, боксёра и жены гангстера.'),
      ('Властелин колец: Возвращение короля', 'Фэнтези', 2003, 'Фродо и Сэм достигают Мордора, а Гэндальф ведёт битву за Гондор.'),
      ('Форрест Гамп', 'Драма', 1994, 'Простодушный парень становится свидетелем важнейших событий XX века.'),
      ('Начало', 'Фантастика', 2010, 'Вор, крадущий идеи из снов, получает последнее задание.'),
      ('Матрица', 'Фантастика', 1999, 'Программист узнаёт, что реальность — это симуляция.'),
      ('Список Шиндлера', 'Драма', 1993, 'Немецкий бизнесмен спасает более тысячи евреев во время Холокоста.'),
      ('Зелёная книга', 'Драма', 2018, 'Итальянский вышибала сопровождает чёрного пианиста в турне по Югу США.')
    `);
  }
  
  return db;
};
