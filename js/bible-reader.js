    // парсит "1-5,7,6" -> массив чисел без дубликатов в порядке
    function parseVerseSpec(spec) {
      if (!spec || !spec.trim()) return null;
      const parts = spec.split(',');
      const out = [];
      const seen = new Set();
      for (let part of parts) {
        part = part.trim();
        if (!part) continue;
        const m = part.match(/^(\d+)-(\d+)$/);
        if (m) {
          let start = parseInt(m[1],10);
          let end = parseInt(m[2],10);
          const step = start <= end ? 1 : -1;
          if (step === 1) {
            for (let i = start; i <= end; i++) {
              if (!seen.has(i)) { out.push(i); seen.add(i); }
            }
          } else {
            for (let i = start; i >= end; i--) {
              if (!seen.has(i)) { out.push(i); seen.add(i); }
            }
          }
        } else {
          const num = parseInt(part,10);
          if (!isNaN(num) && !seen.has(num)) {
            out.push(num);
            seen.add(num);
          }
        }
      }
      return out;
    }

    function parseChapterSpec(spec) {
      if (!spec || !spec.trim()) return null;
      const m = spec.trim().match(/^(\d+)(?:-(\d+))?$/);
      if (!m) return null;
      const a = parseInt(m[1],10);
      const b = m[2] ? parseInt(m[2],10) : a;
      const arr = [];
      if (a <= b) {
        for (let i=a;i<=b;i++) arr.push(i);
      } else {
        for (let i=a;i>=b;i--) arr.push(i);
      }
      return arr;
    }

    function findBook(bible, query) {
      if (!query) return null;
      const q = query.toLowerCase();
      let exact = bible.find(b => b.book && b.book.toLowerCase() === q);
      if (exact) return exact;
      // поиск по варианту названия, abbrev или включению
      exact = bible.find(b => {
        if (b.book && b.book.toLowerCase().includes(q)) return true;
        if (b.abbrev && b.abbrev.toLowerCase().includes(q)) return true;
        return false;
      });
      return exact || null;
    }

    async function loadBible(url) {
      const res = await fetch(url);
      if (!res.ok) throw new Error('Не удалось загрузить JSON: ' + res.status);
      return await res.json();
    }

    // Основная функция, возвращает объект {book, results: [...]}
    async function getBibleText(bookQuery, chapterSpecRaw, verseSpecRaw, url) {
      const bible = await loadBible(url);
      const book = findBook(bible, bookQuery);
      if (!book) throw new Error('Книга не найдена: ' + bookQuery);
      const chapterNums = parseChapterSpec(chapterSpecRaw) || (book.chapters || []).map(c => c.chapter);
      if (!chapterNums || chapterNums.length === 0) throw new Error('Не указана глава и не найдены главы в книге');
      const verseNums = parseVerseSpec(verseSpecRaw);
      const output = [];
      for (const chNum of chapterNums) {
        const ch = (book.chapters || []).find(c => c.chapter === chNum);
        if (!ch) continue;
        let versesToTake;
        if (verseNums === null) {
          versesToTake = (ch.verses || []).map(v => v.verse);
        } else {
          versesToTake = verseNums;
        }
        const verseMap = new Map((ch.verses || []).map(v => [v.verse, v.text]));
        for (const vnum of versesToTake) {
          if (verseMap.has(vnum)) {
            output.push({ chapter: chNum, verse: vnum, text: verseMap.get(vnum) });
          } else {
            output.push({ chapter: chNum, verse: vnum, missing: true });
          }
        }
      }
      return { book: book.book, results: output };
    }

    function render(resultObj) {
      const container = document.getElementById('result');
      container.innerHTML = '';
      const h = document.createElement('div');
      h.className = 'ref';
      h.textContent = resultObj.book;
      container.appendChild(h);
      if (!resultObj.results || resultObj.results.length === 0) {
        const no = document.createElement('div');
        no.textContent = 'Ничего не найдено.';
        container.appendChild(no);
        return;
      }
      // сгруппировать по главам для читаемости
      let currentChapter = null;
      for (const item of resultObj.results) {
        if (item.chapter !== currentChapter) {
          currentChapter = item.chapter;
          const chHeader = document.createElement('div');
          chHeader.textContent = 'Глава ' + currentChapter;
          chHeader.style.marginTop = '1em';
          chHeader.style.fontWeight = '700';
          container.appendChild(chHeader);
        }
        const d = document.createElement('div');
        d.className = 'verse';
        const prefix = document.createElement('span');
        prefix.style.fontWeight='600';
        prefix.textContent = `${item.chapter}:${item.verse} `;
        d.appendChild(prefix);
        const txt = document.createElement('span');
        if (item.missing) {
          txt.textContent = '[отсутствует]';
          txt.className = 'error';
        } else {
          txt.textContent = item.text;
        }
        d.appendChild(txt);
        container.appendChild(d);
      }
    }

    async function performFromUI() {
      const url = document.getElementById('jsonUrl').value.trim();
      const book = document.getElementById('bookInput').value.trim();
      const chapter = document.getElementById('chapterInput').value.trim();
      const verses = document.getElementById('verseInput').value.trim();
      const status = document.getElementById('status');
      status.textContent = 'Загрузка...';
      try {
        const res = await getBibleText(book, chapter, verses, url);
        status.textContent = '';
        render(res);
      } catch (e) {
        status.textContent = '';
        document.getElementById('result').innerHTML = '<div class="error">' + e.message + '</div>';
      }
    }

    document.getElementById('btnFetch').addEventListener('click', performFromUI);

    // автозагрузка из querystring: ?book=Бытие&chapter=1&verses=1-3
    function parseQuery() {
      const qp = Object.fromEntries(new URLSearchParams(window.location.search));
      return {
        book: qp.book || '',
        chapter: qp.chapter || '',
        verses: qp.verses || ''
      };
    }

    window.addEventListener('load', () => {
      const { book, chapter, verses } = parseQuery();
      if (book) document.getElementById('bookInput').value = book;
      if (chapter) document.getElementById('chapterInput').value = chapter;
      if (verses) document.getElementById('verseInput').value = verses;
      if (book && chapter) {
        performFromUI();
      }
    });

    // Экспорт в глобал для программного вызова
    window.getBibleText = getBibleText;