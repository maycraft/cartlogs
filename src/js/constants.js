//API константы
const constants = {
    //Констаны для работаы с API
    API_CART_LOGS: 'http://10.1.1.141:8080/api/cartlogs/journal?',
    API_PRINT_LOGS: 'http://10.1.1.141:8080/api/printlogs/prints?',
    API_USERS: 'http://10.1.1.141:8080/api/cartlogs/users',
    API_PRINT_DELiVERY: 'http://10.1.1.141:8080/api/printlogs/prints?description=Доставка&',
    API_STATISTICS: 'http://10.1.1.141:8080/api/cartlogs/carts?',
    API_CARTRIDGES: 'http://10.1.1.141:8080/api/cartlogs/carts?without_pagination=1',
    
    //Константы для заголовков таблицы
    TABLE_HEADER_CART_LOGS: `<tr>
                                        <th>№</th>
                                        <th>Дата</th>
                                        <th>ФИО</th>
                                        <th>Статус</th>
                                        <th>Инв. номер</th>
                                        <th>Модель</th>
                                        <th>Серийный номер</th>
                                    </tr>`,
    
    TABLE_HEADER_PRINT_LOGS: `<tr>
                                        <th>№</th>
                                        <th>Дата</th>
                                        <th>Отдел</th>
                                        <th>Устройство</th>
                                        <th>Модель</th>
                                        <th>Инв. номер</th>
                                        <th>Имя Хоста</th>
                                        <th>Всего</th>
                                    </tr>`,
    
    TABLE_HEADER_STATISTICS: `<tr>
                                        <th>№</th>
                                        <th>Модель</th>
                                        <th>Инв. номер</th>
                                        <th>Серийный номер</th>
                                        <th>Статус</th>
                                    </tr>`,
    
    TABLE_HEADER_DELIVERY: `<tr>
                                        <th>№</th>
                                        <th>Бренд</th>
                                        <th>Модель</th>
                                        <th>Начало работы принтера</th>
                                        <th>Последние данные</th>
                                        <th>Инв. номер</th>
                                        <th>Имя Хоста</th>
                                        <th>Состояние</th>
                                        <th>Всего напечатано</th>
                                    </tr>`,

}

export {constants};