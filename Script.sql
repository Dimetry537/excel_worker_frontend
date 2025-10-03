DECLARE
  -- Переменные для курсора результата
  l_rc pkg_global.ref_cursor_type;
  l_result pkg_global.result_rtype;

  -- ID нового протокола (form_result_id), который будет получен после создания заголовка
  l_form_result_id NUMBER;

  -- XML для сохранения значений протокола (без <?xml>, чтобы избежать ошибок парсинга)
  l_xml CLOB;

  -- Параметры для создания заголовка протокола (на основе лога, можно параметризовать)
  l_schema VARCHAR2(30) := 'SOLUTION_REG'; -- Схема
  l_table VARCHAR2(30) := 'FORM_RESULT_IN'; -- Таблица
  l_form_id NUMBER := 4538; -- ID формы (протокола)
  l_tag NUMBER := 1; -- Тег (из лога)
  l_dat DATE := SYSDATE; -- Дата (текущая)
  l_docdep_id NUMBER := 1064; -- ID врача/отделения (docdep_id), замените на нужный
  l_patient_id NUMBER := NULL; -- ID пациента (если нужно, иначе NULL)
  l_status NUMBER := 1; -- Статус
  l_his_rec_type_id NUMBER := NULL; -- Тип записи истории (NULL из лога)
  l_his_rec_event_id NUMBER := NULL; -- ID события истории (NULL из лога)

  -- Коллекция для списка l_link_id (ID визитов)
  TYPE table_of_number IS TABLE OF NUMBER;
  l_link_ids table_of_number;

BEGIN
  -- Заполните список ID визитов статически из вашего списка
  l_link_ids := table_of_number(
    6778375, 6778373
  ); -- Все уникальные ID из вашего текста , 6208509, 6778373

  -- Если список пуст, выйдите
  IF l_link_ids.COUNT = 0 THEN
    DBMS_OUTPUT.PUT_LINE('Нет ID визитов для обработки.');
    RETURN;
  END IF;

  -- Цикл по всем l_link_id
  FOR i IN 1 .. l_link_ids.COUNT LOOP
    BEGIN
      -- Шаг 1: Создание заголовка протокола для текущего l_link_id
      pkg_protocol.save_form_result(
        p_schema => l_schema,
        p_table => l_table,
        p_form_id => l_form_id,
        p_link_id => l_link_ids(i), -- Текущий ID визита
        p_tag => l_tag,
        p_dat => l_dat,
        p_docdep_id => l_docdep_id,
        p_patient_id => l_patient_id,
        p_status => l_status,
        p_his_rec_type_id => l_his_rec_type_id,
        p_his_rec_event_id => l_his_rec_event_id,
        p_rc => l_rc
      );

      -- Получаем результат
      FETCH l_rc INTO l_result;
      CLOSE l_rc;

      -- Проверяем на ошибки
      IF l_result.error_code <> pkg_global.err_no THEN
        DBMS_OUTPUT.PUT_LINE('Ошибка создания заголовка для визита ' || l_link_ids(i) || ': ' || l_result.error_text);
        CONTINUE; -- Продолжаем с следующим ID
      END IF;

      -- Сохраняем новый ID протокола
      l_form_result_id := l_result.identity;
      DBMS_OUTPUT.PUT_LINE('Создан заголовок протокола для визита ' || l_link_ids(i) || ' с ID: ' || l_form_result_id);

      -- Шаг 2: Подготовка XML для текущего l_link_id
      l_xml := q'[
        <form form_id="]' || l_form_id || q'[" schema="SOLUTION_REG" table="FORM_RESULT_IN" valtable="FORM_RESULT_VALUE_IN" id="]' || l_form_result_id || q'[" link_id="]' || l_link_ids(i) || q'[">
          <item item_id="51655" value_id="95541">Анамнез собран</item>
          <item item_id="51657" value_id="778040">Удовлетворительное</item>
          <item item_id="51658" value_id="95542">-</item>
          <item item_id="51659" value_id="95543">-</item>
          <item item_id="51660" value_id="95544">-</item>
          <item item_id="51661" value_id="95545">-</item>
          <item item_id="51662" value_id="496109">Прием (осмотр, консультация) врача-терапевта участкового повторный</item>
          <item item_id="51663" value_id="315674">Консультация терапевта</item>
          <item item_id="51664" value_id="367429">Работающий</item>
          <item item_id="38801" value_id="94913">с анамнезом ознакомлен</item>
          <item item_id="38856" value_id="90225">нет</item>
          <item item_id="38861" value_id="90226">да</item>
          <item item_id="38862" value_id="90228">да</item>
          <item item_id="38863" value_id="314798">I группа</item>
          <item item_id="43827" value_id="314631">Взят</item>
          <item item_id="38866" value_id="90231">нет</item>
          <item item_id="38867" value_id="90233">нет</item>
          <item item_id="38868" value_id="90234">нет</item>
          <item item_id="38870" value_id="778040">Удовлетворительное</item>
          <item item_id="38873" value_id="90237">нет</item>
          <item item_id="38881" value_id="6112559">Опрос (анкетирование)</item>
          <item item_id="38883" value_id="780458">Выполнена</item>
          <item item_id="38927" value_id="90252">нет</item>
          <item item_id="38886" value_id="90242">нет</item>
          <item item_id="38892" hidden="1">*</item>
          <item item_id="38917" value_id="90248">нет</item>
          <item item_id="38918" value_id="90250">нет</item>
          <item item_id="38924" />
          <item item_id="38925">*</item>
        </form>
      ]';

      -- Для теста: Выводим начало XML
      DBMS_OUTPUT.PUT_LINE('Начало XML для визита ' || l_link_ids(i) || ': ' || SUBSTR(l_xml, 1, 200));

      -- Шаг 3: Сохранение значений протокола
      pkg_info_controls.save_protocol_by_xml(
        p_xml_param => l_xml,
        p_rc => l_rc
      );

      -- Получаем результат сохранения
      FETCH l_rc INTO l_result;
      CLOSE l_rc;

      -- Проверяем на ошибки
      IF l_result.error_code = pkg_global.err_no THEN
        DBMS_OUTPUT.PUT_LINE('Протокол успешно сохранен для визита ID: ' || l_link_ids(i));
        COMMIT; -- Фиксируем изменения для этого ID
      ELSE
        DBMS_OUTPUT.PUT_LINE('Ошибка сохранения протокола для визита ' || l_link_ids(i) || ': ' || l_result.error_text);
        ROLLBACK; -- Откатываем только для этого ID
      END IF;

    EXCEPTION
      WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('Общая ошибка для визита ' || l_link_ids(i) || ': ' || SQLERRM);
        ROLLBACK; -- Откатываем для этого ID
    END;

  END LOOP;

  DBMS_OUTPUT.PUT_LINE('Обработка завершена для ' || l_link_ids.COUNT || ' визитов.');

END;