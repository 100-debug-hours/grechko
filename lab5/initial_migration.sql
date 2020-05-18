create table users (
    id uuid not null primary key, -- ідентифікатор користувача
    type text not null, -- роль користувача (реєстратор, адмінстратор, інший)
    name text not null, -- ім'я
    surname text not null, -- призвіще
    address text not null, -- адреса проживання
    password_hash text not null, -- хєш пароля користувача
    email text not null unique, -- поштова скринька
    passport_id text not null, -- номер паспорту
    taxes_card_id text not null    -- номер картки платника податків
);

create table pub_formations (
    id uuid not null primary key, -- унікальний ідетифікатор формування
    registrator_id uuid not null references users(id), -- ідентифікатор реєстратора
    type text not null, -- тип формування (політична партія, благодійна організація, творча спілка і т.д...)
    registration_date timestamp not null default now(), -- дата реєстрації (легалізації)
    name text not null, -- повне найменування формування
    executives json, -- перелік та відомості про керівний склад
    residence_address text, -- адреса місця за який зареєстроване формування
    phone_number text, -- номер телефону
    activity_purpose text, -- мета діяльності
    is_disabled bool default false, -- анулювання реєстрації
    disabling_reason text, -- причина анулювання реєстрації
    status text, -- статус формування
    registration_certificate_id text, -- реєстраційний номер у відповідному
    structural_cell_type text, -- вид структурного осередку
    affected_teritory text, -- озплюєма територія
    members_amount integer, -- кількість учсаників формування
    arbitrages json -- відомості про третейських суддів
);

create table documents (
    id uuid not null primary key, -- унікальний ідентифікатор документа
    pf_id uuid not null references pub_formations(id), -- індентифікатор ГФ до якого відноситься цей документ
    type text not null, -- тип документу
    name text not null, -- назва документу
    uri text not null -- посилання на ресурс для завантаження документу
);

create table pf_transaction_log (
    id uuid not null primary key, -- унікальний ідентифікатор транзакції
    pf_id uuid not null references pub_formations(id), -- ідентифікатор ГФ до якого транзакція застосована
    initiator_id uuid not null references users(id), -- ідентифікатор реєстратора який ініціював транзакцію
    type text not null, -- тип транзакції (створення, видалення, редагування)
    date date not null, -- дата виконання транзакції
    old_value json, -- старе значення до транзакції
    new_value json, -- нове значення після транзакції
    col_name text -- назва колонки що була заторкнута
);
