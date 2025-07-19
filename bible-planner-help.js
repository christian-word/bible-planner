// Модуль помощи для планировщика Библии (полная версия)
const BiblePlannerHelp = (function() {
    // CSS стили для модального окна
    const styles = `
    .bph-modal {
        display: none;
        position: fixed;
        z-index: 1000;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        overflow: auto;
        background-color: rgba(0,0,0,0.5);
    }
    
    .bph-modal-content {
        background-color: #fefefe;
        margin: 5% auto;
        padding: 20px;
        border: 1px solid #888;
        width: 90%;
        max-width: 800px;
        max-height: 85vh;
        border-radius: 8px;
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        display: flex;
        flex-direction: column;
    }
    
    .bph-modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-bottom: 15px;
        border-bottom: 1px solid #eee;
    }
    
    .bph-modal-title {
        margin: 0;
        font-size: 1.5em;
        color: #2c3e50;
    }
    
    .bph-close {
        color: #aaa;
        font-size: 28px;
        font-weight: bold;
        cursor: pointer;
        transition: color 0.2s;
    }
    
    .bph-close:hover {
        color: #000;
    }
    
    .bph-modal-body {
        overflow-y: auto;
        flex-grow: 1;
        padding: 15px 0;
    }
    
    .bph-tabs {
        display: flex;
        flex-wrap: wrap;
        margin-bottom: 20px;
        border-bottom: 1px solid #ddd;
        gap: 5px;
    }
    
    .bph-tab {
        padding: 10px 15px;
        cursor: pointer;
        background-color: #f1f1f1;
        border: 1px solid #ddd;
        border-bottom: none;
        border-radius: 5px 5px 0 0;
        transition: all 0.3s;
        user-select: none;
    }
    
    .bph-tab:hover {
        background-color: #e1e1e1;
    }
    
    .bph-tab.active {
        background-color: #4CAF50;
        color: white;
        border-color: #4CAF50;
    }
    
    .bph-tab-content {
        display: none;
        padding: 15px 0;
        animation: fadeIn 0.3s ease-out;
    }
    
    .bph-tab-content.active {
        display: block;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    .bph-h2 {
        color: #2c3e50;
        margin-top: 0;
        border-bottom: 1px solid #eee;
        padding-bottom: 10px;
    }
    
    .bph-h3 {
        color: #27ae60;
        margin-top: 20px;
    }
    
    .bph-ul {
        padding-left: 25px;
    }
    
    .bph-li {
        margin-bottom: 10px;
        line-height: 1.5;
    }
    
    .bph-emoji {
        font-size: 1.2em;
        margin-right: 5px;
        vertical-align: middle;
    }
    
    .bph-tips {
        background-color: #e8f4fc;
        padding: 15px;
        border-radius: 5px;
        margin-top: 30px;
        border-left: 4px solid #3498db;
    }
    
    .bph-tips .bph-h3 {
        color: #3498db;
        margin-top: 0;
    }
    
    .bph-help-button {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background-color: #4CAF50;
        color: white;
        border: none;
        border-radius: 50%;
        width: 50px;
        height: 50px;
        font-size: 20px;
        cursor: pointer;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        z-index: 999;
        transition: background-color 0.3s;
    }
    
    .bph-help-button:hover {
        background-color: #45a049;
    }
    `;

    // HTML содержимое модального окна (полная версия)
    const modalHTML = `
    <div class="bph-modal" id="bph-helpModal">
        <div class="bph-modal-content">
            <div class="bph-modal-header">
                <h2 class="bph-modal-title"><span class="bph-emoji">📖</span> Инструкция по использованию "Планировщика изучения Библии"</h2>
                <span class="bph-close" id="bph-closeModal">&times;</span>
            </div>
            <div class="bph-modal-body">
                <div class="bph-tabs">
                    <div class="bph-tab active" data-tab="bph-overview">🔍 Оглавление</div>
                    <div class="bph-tab" data-tab="bph-main">📅 Основные</div>
                    <div class="bph-tab" data-tab="bph-notes">📝 Заметки</div>
                    <div class="bph-tab" data-tab="bph-tags">🏷️ Теги</div>
                    <div class="bph-tab" data-tab="bph-search">🔎 Поиск</div>
                    <div class="bph-tab" data-tab="bph-export">📤 Экспорт</div>
                    <div class="bph-tab" data-tab="bph-settings">⚙️ Настройки</div>
                </div>
                
                <div id="bph-overview" class="bph-tab-content active">
                    <h3 class="bph-h3">🔍 Оглавление</h3>
                    <ul class="bph-ul">
                        <li class="bph-li"><strong>📅 Основные функции планировщика</strong> - настройка плана чтения, отметка прочитанного, просмотр периодов</li>
                        <li class="bph-li"><strong>📝 Работа с заметками</strong> - создание, редактирование и хранение заметок</li>
                        <li class="bph-li"><strong>🏷️ Использование тегов</strong> - добавление тегов, управление ими, облако тегов</li>
                        <li class="bph-li"><strong>🔎 Поиск и фильтрация</strong> - поиск по тегам, фильтрация карточек</li>
                        <li class="bph-li"><strong>📤 Экспорт данных</strong> - экспорт заметок в файл Markdown</li>
                        <li class="bph-li"><strong>⚙️ Настройки программы</strong> - напоминания, сброс данных</li>
                    </ul>
                </div>
                
                <div id="bph-main" class="bph-tab-content">
                    <h3 class="bph-h3"><span class="bph-emoji">📅</span> Основные функции планировщика</h3>
                    <h4>Выбор плана чтения</h4>
                    <p>В разделе "Настройка плана" выберите:</p>
                    <ul class="bph-ul">
                        <li class="bph-li"><strong>Дату начала</strong> - от этой даты будет строиться график чтения</li>
                        <li class="bph-li"><strong>Тип плана</strong>:
                            <ul class="bph-ul">
                                <li class="bph-li">За год - полное прочтение Библии за 365 дней</li>
                                <li class="bph-li">За полгода - ускоренный вариант за 183 дня</li>
                                <li class="bph-li">Хронологический - чтение в историческом порядке событий</li>
                                <li class="bph-li">Тематический - изучение по ключевым темам</li>
                            </ul>
                        </li>
                    </ul>
                    
                    <h4>Отметка прочитанного</h4>
                    <p>В каждой карточке дня:</p>
                    <ul class="bph-ul">
                        <li class="bph-li">Нажмите на чекбокс "Прочитано" для отметки выполнения</li>
                        <li class="bph-li">Завершенные дни выделяются зеленым цветом</li>
                        <li class="bph-li">Пропущенные дни подсвечиваются красным</li>
                    </ul>
                    
                    <h4>Просмотр разных периодов</h4>
                    <p>Используйте кнопки в верхней панели:</p>
                    <ul class="bph-ul">
                        <li class="bph-li">Все дни - полный список запланированного чтения</li>
                        <li class="bph-li">Сегодня - только текущий день</li>
                        <li class="bph-li">Неделя - чтения на ближайшие 7 дней</li>
                        <li class="bph-li">Пропущенные - просмотр невыполненных заданий</li>
                    </ul>
                </div>
                
                <div id="bph-notes" class="bph-tab-content">
                    <h3 class="bph-h3"><span class="bph-emoji">📝</span> Работа с заметками</h3>
                    <h4>Создание заметки</h4>
                    <ul class="bph-ul">
                        <li class="bph-li">Найдите нужный день в плане чтения</li>
                        <li class="bph-li">В разделе "Заметки" введите ваш текст</li>
                        <li class="bph-li">Заметка сохраняется автоматически при изменении</li>
                    </ul>
                    
                    <h4>Особенности:</h4>
                    <ul class="bph-ul">
                        <li class="bph-li">Заметки привязываются к конкретному дню и отрывку</li>
                        <li class="bph-li">Поддерживается многострочный текст</li>
                        <li class="bph-li">Можно редактировать в любое время</li>
                        <li class="bph-li">Все заметки сохраняются между сеансами</li>
                    </ul>
                </div>
                
                <div id="bph-tags" class="bph-tab-content">
                    <h3 class="bph-h3"><span class="bph-emoji">🏷️</span> Использование тегов</h3>
                    <h4>Добавление тегов</h4>
                    <ul class="bph-ul">
                        <li class="bph-li">В поле "Добавить теги" введите ключевые слова</li>
                        <li class="bph-li">Разделяйте теги запятыми (например: "вера, надежда, любовь")</li>
                        <li class="bph-li">Нажмите Enter для сохранения</li>
                    </ul>
                    
                    <h4>Управление тегами</h4>
                    <ul class="bph-ul">
                        <li class="bph-li">Чтобы удалить тег: нажмите на крестик (×) рядом с ним</li>
                        <li class="bph-li">Популярные теги автоматически получают цветовую метку</li>
                        <li class="bph-li">Теги сохраняются вместе с заметками</li>
                    </ul>
                    
                    <h4>Облако тегов</h4>
                    <ul class="bph-ul">
                        <li class="bph-li">В верхней части страницы отображаются все используемые теги</li>
                        <li class="bph-li">Размер тега показывает его частоту использования</li>
                        <li class="bph-li">Клик по тегу выполняет поиск по нему</li>
                    </ul>
                </div>
                
                <div id="bph-search" class="bph-tab-content">
                    <h3 class="bph-h3"><span class="bph-emoji">🔎</span> Поиск и фильтрация</h3>
                    <h4>Поиск по тегам</h4>
                    <ul class="bph-ul">
                        <li class="bph-li">Введите тег в поле поиска (верхняя панель)</li>
                        <li class="bph-li">Нажмите "Найти" или Enter</li>
                        <li class="bph-li">Будут показаны только карточки с этим тегом</li>
                        <li class="bph-li">Для сброса поиска нажмите "Сбросить"</li>
                    </ul>
                    
                    <h4>Фильтрация:</h4>
                    <ul class="bph-ul">
                        <li class="bph-li">Используйте кнопки просмотра (Все/Сегодня/Неделя/Пропущенные)</li>
                        <li class="bph-li">Комбинируйте с поиском по тегам для точных результатов</li>
                    </ul>
                </div>
                
                <div id="bph-export" class="bph-tab-content">
                    <h3 class="bph-h3"><span class="bph-emoji">📤</span> Экспорт данных</h3>
                    <h4>Экспорт заметок</h4>
                    <ul class="bph-ul">
                        <li class="bph-li">Нажмите кнопку "Экспорт заметок"</li>
                        <li class="bph-li">Автоматически скачается файл в формате Markdown (.md)</li>
                        <li class="bph-li">Файл содержит:
                            <ul class="bph-ul">
                                <li class="bph-li">Все ваши заметки</li>
                                <li class="bph-li">Связанные отрывки из Библии</li>
                                <li class="bph-li">Прикрепленные теги</li>
                                <li class="bph-li">Даты создания заметок</li>
                            </ul>
                        </li>
                    </ul>
                </div>
                
                <div id="bph-settings" class="bph-tab-content">
                    <h3 class="bph-h3"><span class="bph-emoji">⚙️</span> Настройки программы</h3>
                    <h4>Напоминания</h4>
                    <ul class="bph-ul">
                        <li class="bph-li">Включите опцию "Включить напоминания"</li>
                        <li class="bph-li">Установите удобное время уведомлений</li>
                        <li class="bph-li">Нажмите "Настроить"</li>
                        <li class="bph-li">При пропуске чтения вы получите уведомление</li>
                    </ul>
                    
                    <h4>Сброс данных</h4>
                    <ul class="bph-ul">
                        <li class="bph-li">Сбросить прогресс - обнуляет отметки о прочтении</li>
                        <li class="bph-li">Очистить все - полностью удаляет все данные (необратимо!)</li>
                    </ul>
                </div>
                
                <div class="bph-tips">
                    <h3 class="bph-h3"><span class="bph-emoji">💡</span> Советы по эффективному использованию</h3>
                    <ul class="bph-ul">
                        <li class="bph-li">Используйте теги для категоризации тем (например: "чудеса", "притчи")</li>
                        <li class="bph-li">Делайте заметки сразу после чтения</li>
                        <li class="bph-li">Регулярно проверяйте раздел "Пропущенные"</li>
                        <li class="bph-li">Экспортируйте заметки для создания личного дневника изучения</li>
                        <li class="bph-li">Настройте напоминания на удобное время</li>
                    </ul>
                    <p>Эта инструкция будет доступна в программе по кнопке "Помощь".</p>
                </div>
            </div>
        </div>
    </div>
    <button class="bph-help-button" id="bph-helpButton">?</button>
    `;

    // Функция переключения вкладок (оптимизированная)
    function switchTab(tabId) {
        // Находим все элементы
        const contents = document.querySelectorAll('.bph-tab-content');
        const tabs = document.querySelectorAll('.bph-tab');
        const targetContent = document.getElementById(tabId);
        const targetTab = document.querySelector(`.bph-tab[data-tab="${tabId}"]`);

        // Быстрая проверка элементов
        if (!targetContent || !targetTab) return;

        // Скрываем все содержимое вкладок
        contents.forEach(content => {
            content.classList.remove('active');
        });

        // Деактивируем все табы
        tabs.forEach(tab => {
            tab.classList.remove('active');
        });

        // Показываем нужную вкладку
        targetContent.classList.add('active');
        targetTab.classList.add('active');
    }

    // Инициализация модуля
    function init() {
        // Добавляем стили
        const styleElement = document.createElement('style');
        styleElement.textContent = styles;
        document.head.appendChild(styleElement);
        
        // Добавляем HTML
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Обработчики событий (с делегированием)
        document.addEventListener('click', function(e) {
            // Открытие модального окна
            if (e.target.id === 'bph-helpButton') {
                document.getElementById('bph-helpModal').style.display = 'block';
            }
            
            // Закрытие модального окна
            if (e.target.id === 'bph-closeModal' || e.target === document.getElementById('bph-helpModal')) {
                document.getElementById('bph-helpModal').style.display = 'none';
            }
            
            // Переключение вкладок
            if (e.target.classList.contains('bph-tab')) {
                const tabId = e.target.getAttribute('data-tab');
                switchTab(tabId);
            }
        });
    }

    // Публичные методы
    return {
        init: init,
        open: function() { document.getElementById('bph-helpModal').style.display = 'block'; },
        close: function() { document.getElementById('bph-helpModal').style.display = 'none'; }
    };
})();

// Автоматическая инициализация
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', BiblePlannerHelp.init);
} else {
    BiblePlannerHelp.init();
}