# 🚀 IT-инкубатор — Modern Landing Page

![Next.js](https://img.shields.io/badge/NEXT.JS-000000?style=for-the-badge&logo=next.js&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/TAILWIND_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![TypeScript](https://img.shields.io/badge/TYPESCRIPT-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Framer Motion](https://img.shields.io/badge/FRAMER_MOTION-0055FF?style=for-the-badge&logo=framer&logoColor=white)
![Three.js (R3F)](https://img.shields.io/badge/THREE.JS-000000?style=for-the-badge&logo=threedotjs&logoColor=white)

Современный, быстрый и стильный сайт для сервиса **IT-инкубатор**. Проект построен на самых передовых технологиях веб-разработки с упором на эстетику, плавность анимаций, интеграцию 3D-графики и высокую конверсию.

## ✨ Ключевые особенности

- **Интерактивное 3D:** Самособирающийся глянцевый кубик Рубика, написанный на React Three Fiber с кастомным контурным неоновым освещением.
- **Плавные анимации:** Появление элементов, расходящиеся круги и физика кнопок реализованы с помощью Framer Motion.
- **Оптимизация:** Динамический импорт (Lazy Loading) тяжелых 3D-сцен для мгновенной загрузки основного контента.
- **Адаптивность:** Идеальное отображение на любых устройствах — от смартфонов до широкоформатных мониторов.

## 🛠 Технологический стек

- **Фреймворк:** [Next.js](https://nextjs.org/) (App Router)
- **Стилизация:** [Tailwind CSS](https://tailwindcss.com/)
- **Анимации:** [Framer Motion](https://www.framer.com/motion/)
- **3D Графика:** [Three.js](https://threejs.org/) + [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber/) + [@react-three/drei](https://github.com/pmndrs/drei)
- **Язык:** [TypeScript](https://www.typescriptlang.org/)

---

## 🚀 Установка и запуск

Следуйте этим инструкциям, чтобы развернуть копию проекта на вашем локальном компьютере для разработки и тестирования.

### Предварительные требования

Убедитесь, что у вас установлен **Node.js** (версии 18.x или выше) и пакетный менеджер (npm, yarn или pnpm).

### Установка шагов

1. **Клонируйте репозиторий:**
   ```bash
   git clone https://github.com/ibryaev/it-incubator/
   ```

2. **Перейдите в папку с проектом:**
   ```bash
   cd it-incubator/src/site/
   ```

3. **Установите зависимости:**
   ```bash
   npm install
   ```

4. **Запустите сервер разработки:**
   ```bash
   npm run dev
   ```

5. **Откройте проект:**
   Перейдите в браузере по адресу [http://localhost:3000](http://localhost:3000). Вы должны увидеть загрузившуюся главную страницу с анимациями.

---

## 📦 Сборка для продакшена

Для того чтобы скомпилировать проект для публикации на хостинге (Vercel, Railway, VPS и др.), выполните:

```bash
npm run build
npm run start
```