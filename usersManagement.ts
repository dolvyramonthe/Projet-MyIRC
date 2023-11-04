import { db } from "./db";
import { RowDataPacket } from 'mysql2';

export function insertUserData(username: string, password: string, role_id: number): void {
    const query = 'INSERT INTO users (username, password, role_id) VALUES (?, ?, ?)';

    db.query(query, [username, password, role_id], (error, results) => {
        if (error) {
            console.error('Error inserting user data:', error);
        } else {
            console.log('User data inserted successfully.');
        }
    });
}

export function updatePassword(username: string, newPassword: string): void {
    const query = 'UPDATE users SET password = ? WHERE username = ?';

    db.query(query, [newPassword, username], (error, results) => {
        if (error) {
            console.error('Error updating password:', error);
        } else {
            console.log('Password updated successfully.');
        }
    });
}

export function updateGroup(groupId: number, groupDesc: string): void {
    const query = 'UPDATE chat_groups SET desc = ? WHERE id = ?';

    db.query(query, [groupDesc, groupId], (error, results) => {
        if (error) {
            console.error('Error updating Group:', error);
        } else {
            console.log('Group updated successfully.');
        }
    });
}


// export function getUserByUsername(username: string, callback: (error: Error | null, user: any | null) => void): void {
//     const query = 'SELECT * FROM users WHERE username = ?';

//     db.query(query, [username], (error, results) => {
//         if (error) {
//             console.error('Error retrieving user:', error);
//             callback(error, null);
//         } else {
//             if (results.length > 0) {
//                 const user = results[0];
//                 console.log('User retrieved successfully.');
//                 callback(null, user);
//             } else {
//                 console.log('User not found.');
//                 callback(null, null);
//             }
//         }
//     });
// }

// export function getTableData(statement: string): any[] {
//     let tableTata: any[] = [];
//     let dataItem: any = {};
//     const query = statement;

//     db.query(query, (error, result) => {
//         if(error) {
//             console.error(error);
//         } else {
//             console.log('Table Found');
//             const data = <RowDataPacket> result;
            
//             for(let i: number = 0; i < data.lenth; i++) {
//                 dataItem = data[i];
//                 tableTata.push(dataItem);
//             }
//         }
//     });

//     return tableTata;
// }

export function getTableData(statement: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
        const query = statement;
        const tableData: any[] = [];

        db.query(query, (error, result) => {
            if (error) {
                console.error(error);
                reject(error);
            } else {
                console.log('Table Found');
                const data = <RowDataPacket[]>result;

                for (let i = 0; i < data.length; i++) {
                    tableData.push(data[i]);
                }

                resolve(tableData);
            }
        });
    });
}