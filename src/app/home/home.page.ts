import { Component } from '@angular/core';
import { ITask } from "./ITask/ITask.interface";
import { AlertController } from "@ionic/angular";
import { Storage } from "@ionic/storage-angular";

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {

  isToastOpen = false;
  toastMessage = '';
  tasks: ITask[] = [];

  constructor(private _AlertController: AlertController, private _Storage: Storage) { }

  async ngOnInit() {
    await this._Storage.create();
    const tasks = await this._Storage.get('tasks');
    this.tasks = tasks ? JSON.parse(tasks) : [];
  }

  // Agregar tareas nuevas
  async open() {
    const alert = await this._AlertController.create({
      header: 'Agrega nueva tarea',
      inputs: [
        {
          type: 'text',
          name: 'title',
          placeholder: 'Ingrese tarea'
        }
      ],
      buttons: [{
        text: 'Cancelar',
        role: 'cancel'
      },
      {
        text: 'Agregar',
        handler: (data) => {
          if (data.title.trim() === '') {
            this.showToast('La tarea no puede estar vacía');
            return;
          }

          const newId = this.tasks.length > 0 ? Math.max(...this.tasks.map(t => t.id)) + 1 : 1;
          this.tasks.push({
            id: newId,
            title: data.title,
            done: false
          });
          this.saveTask();
          this.showToast('Tarea agregada correctamente');
        }
      }]
    });

    await alert.present();
  }

  // Actualizar las tareas
  async updateTask(task: ITask) {
    const alert = await this._AlertController.create({
      header: 'Editar tarea',
      inputs: [
        {
          type: 'text',
          name: 'title',
          value: task.title,
          placeholder: 'Actualizar tarea'
        }
      ],
      buttons: [{
        text: 'Cancelar',
        role: 'cancel'
      },
      {
        text: 'Actualizar',
        handler: (data) => {
          if (data.title.trim() === '') {
            this.showToast('La tarea no puede estar vacía');
            return;
          }
          task.title = data.title;
          this.saveTask();
          this.showToast('Tarea actualizada correctamente');
        }
      }]
    });

    await alert.present();
  }

  // Eliminar tareas
  async deleteTask(task: ITask) {
    const alert = await this._AlertController.create({
      header: 'Confirmar eliminación',
      message: `¿Estás seguro de eliminar "${task.title}"?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            const index = this.tasks.indexOf(task);
            if (index > -1) {
              this.tasks.splice(index, 1);
              this.saveTask();
              this.showToast('Tarea eliminada correctamente');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  // Marcar si la tarea esta hecha o no
  async toggleTask(task: ITask, event: any) {
    task.done = event.detail.checked;
    this.saveTask();
    const estado = task.done ? 'completada' : 'pendiente';
    this.showToast(`Tarea marcada como ${estado}`);
  }

  // Guardar tareas
  private async saveTask() {
    await this._Storage.set('tasks', JSON.stringify(this.tasks));
  }

  // Mostrar mensaje personalizado
  private showToast(message: string) {
    this.toastMessage = message;
    this.isToastOpen = true;
    
    // Cerrar pasado el tiempo establecido
    setTimeout(() => {
      this.isToastOpen = false;
    }, 3000);
  }

  setOpen(isOpen: boolean) {
    this.isToastOpen = isOpen;
  }
}
