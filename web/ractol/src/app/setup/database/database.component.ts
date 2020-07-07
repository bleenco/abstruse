import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-database',
  templateUrl: './database.component.html',
  styleUrls: ['./database.component.sass']
})
export class DatabaseComponent implements OnInit {
  drivers: { value: any; placeholder: string }[] = [
    { value: 'mysql', placeholder: 'MySQL' },
    { value: 'postgres', placeholder: 'PostgreSQL' },
    { value: 'mssql', placeholder: 'Microsoft SQL Server' }
  ];
  defaultHostname = '127.0.0.1';
  defaultPorts = {
    mysql: 3306,
    postgres: 5432,
    mssql: 1433
  };
  defaultUsername = 'root';
  defaultPassword = 'test';
  defaultDriver = 'mssql';

  constructor() {}

  ngOnInit(): void {}
}
