const electron = require('electron');
const url = require('url');
const path = require('path');
const BrowerWindow=electron.BrowserWindow
const app=electron.app
const Menu=electron.Menu
const ipcMain=electron.ipcMain;
// const {app,BrowerWindow}=electron;
// Set ENV
process.env.NODE_ENV='production';
// 定义主窗口
let mainWindow;
let addWindow;

//Listen for app to be ready
app.on('ready',function(){
     //Create new window
     mainWindow=new BrowerWindow({
          webPreferences: {
               nodeIntegration: true,
          }
     });
     //Load html into window
     mainWindow.loadURL(url.format({
          pathname:path.join(__dirname,'mainWindow.html'),
          protocol:'file',
          slashes:true
     }));
     // Quit app when closed
     mainWindow.on('close',function(){
          app.quit();
     });
     // Build menu from template
     const mainMenu=Menu.buildFromTemplate(mainMenuTemplate);
     //Insert menu
     Menu.setApplicationMenu(mainMenu);
});

// Handle create add window
function createAddWindow(){
     //Create new window
     addWindow=new BrowerWindow({
          width:300,
          height:200,
          webPreferences: {
               nodeIntegration: true,
          },
          title:'Add Shopping List Item'
     });
     //Load html into window
     addWindow.loadURL(url.format({
          pathname:path.join(__dirname,'addWindow.html'),
          protocol:'file',
          slashes:true
     }));
     // Garbage collection handle
     addWindow.on('close',function(){
          addWindow=null;
     });
  
}

// Catch item:add
ipcMain.on('item:add',function(e,item){
     mainWindow.webContents.send('item:add',item);
     addWindow.close();
});

// 菜单模板
const mainMenuTemplate=[
     {
          label:'File',
          submenu:[
               {
                    label:'Add Item',
                    click(){
                         createAddWindow();
                    }
               },
               {
                    label:'Clear Items',
                    click(){
                         mainWindow.webContents.send('item:clear');
                    }
               },
               {
                    label:'Quit',
                    // 快捷退出
                    accelerator:process.platform=='darwin'?'command+Q':'Ctrl+Q',
                    click(){
                         app.quit();
                    }
               }
          ]
     }
];

// If mac,add empty object to menu
if(process.platform=='darwin'){
     mainMenuTemplate.unshift({});
}

// Add developer tools item if not in prod
if(process.env.NODE_ENV !== 'production'){
     mainMenuTemplate.push({
          label:'Developer Tools',
          submenu:[
               {
                    label:'Toggle DecTools',
                    accelerator:process.platform=='darwin'?'command+I':'Ctrl+I',
                    click(item,focusedWindow){
                         focusedWindow.toggleDevTools();
                    }
               },
               {
                    role:'reload'
               }
          ]
     });
}