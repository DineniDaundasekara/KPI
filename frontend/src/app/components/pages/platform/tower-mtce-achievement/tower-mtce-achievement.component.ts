import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { catchError, finalize } from 'rxjs/operators';
import { forkJoin, of } from 'rxjs';
import * as ExcelJS from 'exceljs';

type TowerDetail = {
  Column1: string;
  Column2?: number | string;
  Column3?: number | string;
  Column4?: number | string;
};

type TowerRecord = {
  month: string;
  details: TowerDetail[];
};

type KpiTowerRow = {
  _id?: string;
  no?: number;
  responsibility?: string;
  frequency?: string;
  weightage?: string | number;
  kpi?: string;
  target?: string;
  calculation?: string;
  platform?: string;
  dataSources?: string;
};

const TOWER_KPI_FALLBACK: KpiTowerRow[] = [
  {
    _id: 'fallback-1',
    no: 1,
    responsibility: 'Proper maintaining and cleaning of tower site, access roads, tower leg bases and guy bases.',
    frequency: 'Quaterly',
    weightage: '60%',
    kpi: '100%'
  },
  {
    _id: 'fallback-2',
    no: 2,
    responsibility: 'Visual inspection of tower condition, aviation lighting system etc.',
    frequency: 'Quaterly',
    weightage: '10%',
    kpi: '100%'
  },
  {
    _id: 'fallback-3',
    no: 3,
    responsibility: 'Measure earth readings and inspect Earthing system.',
    frequency: 'Quaterly',
    weightage: '30%',
    kpi: '100%'
  }
];

const TOWER_COLUMNS = [
  'NW/CPN',
  'NW/CPS',
  'NW/EP',
  'NW/NCP',
  'NW/NP-1',
  'NW/NP-2',
  'NW/NWPE',
  'NW/NWPW',
  'NW/SAB',
  'NW/SPE',
  'NW/SPW',
  'NW/UVA',
  'NW/WPC-1',
  'NW/WPC-2',
  'NW/WPE',
  'NW/WPN',
  'NW/WPNE',
  'NW/WPS',
  'NW/WPSE',
  'NW/WPSW'
];

const TOWER_TABLE_FALLBACK: TowerRecord[] = [
  {
    month: 'January',
    details: [
      { Column1: 'NW/CPN', Column2: '8', Column3: 8, Column4: '8' },
      { Column1: 'NW/CPS', Column2: '10', Column3: 14, Column4: '10' },
      { Column1: 'NW/EP', Column2: '5', Column3: 5, Column4: '5' },
      { Column1: 'NW/NCP', Column2: '9', Column3: 9, Column4: '9' },
      { Column1: 'NW/NP-1', Column2: '4', Column3: 4, Column4: '4' },
      { Column1: 'NW/NP-2', Column2: '10', Column3: 4, Column4: '10' },
      { Column1: 'NW/NWPE', Column2: '4', Column3: 4, Column4: '4' },
      { Column1: 'NW/NWPW', Column2: '3', Column3: 0, Column4: '3' },
      { Column1: 'NW/SAB', Column2: '4', Column3: 4, Column4: '4' },
      { Column1: 'NW/SPE', Column2: '10', Column3: 0, Column4: '10' },
      { Column1: 'NW/SPW', Column2: '6', Column3: 0, Column4: '6' },
      { Column1: 'NW/UVA', Column2: '7', Column3: 0, Column4: '7' },
      { Column1: 'NW/WPC-1', Column2: '3', Column3: 0, Column4: '3' },
      { Column1: 'NW/WPC-2', Column2: '1', Column3: 3, Column4: '1' },
      { Column1: 'NW/WPE', Column2: '2', Column3: 1, Column4: '2' },
      { Column1: 'NW/WPN', Column2: '4', Column3: 1, Column4: '4' },
      { Column1: 'NW/WPNE', Column2: '4', Column3: 0, Column4: '4' },
      { Column1: 'NW/WPS', Column2: '2', Column3: 1, Column4: '2' },
      { Column1: 'NW/WPSE', Column2: '2', Column3: 0, Column4: '2' },
      { Column1: 'NW/WPSW', Column2: '1', Column3: 0, Column4: '1' }
    ]
  },
  {
    month: 'February',
    details: [
      { Column1: 'NW/CPN', Column2: '8', Column3: 8, Column4: '16' },
      { Column1: 'NW/CPS', Column2: '9', Column3: 8, Column4: '19' },
      { Column1: 'NW/EP', Column2: '5', Column3: 4, Column4: '10' },
      { Column1: 'NW/NCP', Column2: '9', Column3: 9, Column4: '18' },
      { Column1: 'NW/NP-1', Column2: '3', Column3: 4, Column4: '7' },
      { Column1: 'NW/NP-2', Column2: '9', Column3: 9, Column4: '19' },
      { Column1: 'NW/NWPE', Column2: '4', Column3: 4, Column4: '8' },
      { Column1: 'NW/NWPW', Column2: '3', Column3: 6, Column4: '6' },
      { Column1: 'NW/SAB', Column2: '4', Column3: 4, Column4: '8' },
      { Column1: 'NW/SPE', Column2: '10', Column3: 18, Column4: '20' },
      { Column1: 'NW/SPW', Column2: '5', Column3: 10, Column4: '11' },
      { Column1: 'NW/UVA', Column2: '6', Column3: 9, Column4: '13' },
      { Column1: 'NW/WPC-1', Column2: '3', Column3: 2, Column4: '6' },
      { Column1: 'NW/WPC-2', Column2: '1', Column3: 1, Column4: '2' },
      { Column1: 'NW/WPE', Column2: '1', Column3: 1, Column4: '3' },
      { Column1: 'NW/WPN', Column2: '3', Column3: 4, Column4: '7' },
      { Column1: 'NW/WPNE', Column2: '4', Column3: 9, Column4: '8' },
      { Column1: 'NW/WPS', Column2: '2', Column3: 2, Column4: '4' },
      { Column1: 'NW/WPSE', Column2: '2', Column3: 0, Column4: '4' },
      { Column1: 'NW/WPSW', Column2: '1', Column3: 1, Column4: '2' }
    ]
  },
  {
    month: 'March',
    details: [
      { Column1: 'NW/CPN', Column2: '8', Column3: 8, Column4: '24' },
      { Column1: 'NW/CPS', Column2: '9', Column3: 6, Column4: '28' },
      { Column1: 'NW/EP', Column2: '5', Column3: 6, Column4: '15' },
      { Column1: 'NW/NCP', Column2: '9', Column3: 10, Column4: '27' },
      { Column1: 'NW/NP-1', Column2: '3', Column3: 2, Column4: '10' },
      { Column1: 'NW/NP-2', Column2: '9', Column3: 14, Column4: '28' },
      { Column1: 'NW/NWPE', Column2: '3', Column3: 3, Column4: '11' },
      { Column1: 'NW/NWPW', Column2: '3', Column3: 3, Column4: '9' },
      { Column1: 'NW/SAB', Column2: '3', Column3: 3, Column4: '11' },
      { Column1: 'NW/SPE', Column2: '9', Column3: 8, Column4: '29' },
      { Column1: 'NW/SPW', Column2: '5', Column3: 6, Column4: '16' },
      { Column1: 'NW/UVA', Column2: '6', Column3: 6, Column4: '19' },
      { Column1: 'NW/WPC-1', Column2: '2', Column3: 3, Column4: '8' },
      { Column1: 'NW/WPC-2', Column2: '1', Column3: 0, Column4: '3' },
      { Column1: 'NW/WPE', Column2: '1', Column3: 2, Column4: '4' },
      { Column1: 'NW/WPN', Column2: '3', Column3: 5, Column4: '10' },
      { Column1: 'NW/WPNE', Column2: '3', Column3: 2, Column4: '11' },
      { Column1: 'NW/WPS', Column2: '1', Column3: 2, Column4: '5' },
      { Column1: 'NW/WPSE', Column2: '2', Column3: 0, Column4: '6' },
      { Column1: 'NW/WPSW', Column2: '1', Column3: 2, Column4: '3' }
    ]
  },
  {
    month: 'April',
    details: [
      { Column1: 'NW/CPN', Column2: '8', Column3: 8, Column4: '8' },
      { Column1: 'NW/CPS', Column2: '10', Column3: 14, Column4: '10' },
      { Column1: 'NW/EP', Column2: '5', Column3: 6, Column4: '5' },
      { Column1: 'NW/NCP', Column2: '9', Column3: 8, Column4: '9' },
      { Column1: 'NW/NP-1', Column2: '4', Column3: 4, Column4: '4' },
      { Column1: 'NW/NP-2', Column2: '10', Column3: 6, Column4: '10' },
      { Column1: 'NW/NWPE', Column2: '4', Column3: 4, Column4: '4' },
      { Column1: 'NW/NWPW', Column2: '3', Column3: 2, Column4: '3' },
      { Column1: 'NW/SAB', Column2: '4', Column3: 4, Column4: '4' },
      { Column1: 'NW/SPE', Column2: '10', Column3: 9, Column4: '10' },
      { Column1: 'NW/SPW', Column2: '6', Column3: 5, Column4: '6' },
      { Column1: 'NW/UVA', Column2: '7', Column3: 6, Column4: '7' },
      { Column1: 'NW/WPC-1', Column2: '3', Column3: 2, Column4: '3' },
      { Column1: 'NW/WPC-2', Column2: '1', Column3: 0, Column4: '1' },
      { Column1: 'NW/WPE', Column2: '2', Column3: 1, Column4: '2' },
      { Column1: 'NW/WPN', Column2: '4', Column3: 2, Column4: '4' },
      { Column1: 'NW/WPNE', Column2: '4', Column3: 7, Column4: '4' },
      { Column1: 'NW/WPS', Column2: '2', Column3: 2, Column4: '2' },
      { Column1: 'NW/WPSE', Column2: '2', Column3: 0, Column4: '2' },
      { Column1: 'NW/WPSW', Column2: '1', Column3: 0, Column4: '1' }
    ]
  },
  {
    month: 'May',
    details: [
      { Column1: 'NW/CPN', Column2: '8', Column3: 8, Column4: '16' },
      { Column1: 'NW/CPS', Column2: '9', Column3: 6, Column4: '19' },
      { Column1: 'NW/EP', Column2: '5', Column3: 5, Column4: '10' },
      { Column1: 'NW/NCP', Column2: '9', Column3: 8, Column4: '18' },
      { Column1: 'NW/NP-1', Column2: '3', Column3: 4, Column4: '7' },
      { Column1: 'NW/NP-2', Column2: '9', Column3: 6, Column4: '19' },
      { Column1: 'NW/NWPE', Column2: '4', Column3: 4, Column4: '8' },
      { Column1: 'NW/NWPW', Column2: '3', Column3: 3, Column4: '6' },
      { Column1: 'NW/SAB', Column2: '4', Column3: 4, Column4: '8' },
      { Column1: 'NW/SPE', Column2: '10', Column3: 10, Column4: '20' },
      { Column1: 'NW/SPW', Column2: '5', Column3: 5, Column4: '11' },
      { Column1: 'NW/UVA', Column2: '6', Column3: 7, Column4: '13' },
      { Column1: 'NW/WPC-1', Column2: '3', Column3: 2, Column4: '6' },
      { Column1: 'NW/WPC-2', Column2: '1', Column3: 0, Column4: '2' },
      { Column1: 'NW/WPE', Column2: '1', Column3: 1, Column4: '3' },
      { Column1: 'NW/WPN', Column2: '3', Column3: 3, Column4: '7' },
      { Column1: 'NW/WPNE', Column2: '4', Column3: 0, Column4: '8' },
      { Column1: 'NW/WPS', Column2: '2', Column3: 1, Column4: '4' },
      { Column1: 'NW/WPSE', Column2: '2', Column3: 0, Column4: '4' },
      { Column1: 'NW/WPSW', Column2: '1', Column3: 0, Column4: '2' }
    ]
  },
  {
    month: 'June',
    details: [
      { Column1: 'NW/CPN', Column2: '8', Column3: 8, Column4: '24' },
      { Column1: 'NW/CPS', Column2: '9', Column3: 8, Column4: '28' },
      { Column1: 'NW/EP', Column2: '5', Column3: 5, Column4: '15' },
      { Column1: 'NW/NCP', Column2: '9', Column3: 10, Column4: '27' },
      { Column1: 'NW/NP-1', Column2: '3', Column3: 2, Column4: '10' },
      { Column1: 'NW/NP-2', Column2: '9', Column3: 13, Column4: '28' },
      { Column1: 'NW/NWPE', Column2: '3', Column3: 3, Column4: '11' },
      { Column1: 'NW/NWPW', Column2: '3', Column3: 4, Column4: '9' },
      { Column1: 'NW/SAB', Column2: '3', Column3: 3, Column4: '11' },
      { Column1: 'NW/SPE', Column2: '9', Column3: 9, Column4: '29' },
      { Column1: 'NW/SPW', Column2: '5', Column3: 6, Column4: '16' },
      { Column1: 'NW/UVA', Column2: '6', Column3: 6, Column4: '19' },
      { Column1: 'NW/WPC-1', Column2: '2', Column3: 4, Column4: '8' },
      { Column1: 'NW/WPC-2', Column2: '1', Column3: 0, Column4: '3' },
      { Column1: 'NW/WPE', Column2: '1', Column3: 1, Column4: '4' },
      { Column1: 'NW/WPN', Column2: '3', Column3: 6, Column4: '10' },
      { Column1: 'NW/WPNE', Column2: '3', Column3: 4, Column4: '11' },
      { Column1: 'NW/WPS', Column2: '1', Column3: 2, Column4: '5' },
      { Column1: 'NW/WPSE', Column2: '2', Column3: 0, Column4: '6' },
      { Column1: 'NW/WPSW', Column2: '1', Column3: 3, Column4: '3' }
    ]
  },
  {
    month: 'July',
    details: [
      { Column1: 'NW/CPN', Column2: '8', Column3: 8, Column4: '8' },
      { Column1: 'NW/CPS', Column2: '10', Column3: 10, Column4: '10' },
      { Column1: 'NW/EP', Column2: '5', Column3: 5, Column4: '5' },
      { Column1: 'NW/NCP', Column2: '9', Column3: 9, Column4: '9' },
      { Column1: 'NW/NP-1', Column2: '4', Column3: 4, Column4: '4' },
      { Column1: 'NW/NP-2', Column2: '10', Column3: 3, Column4: '10' },
      { Column1: 'NW/NWPE', Column2: '4', Column3: 4, Column4: '4' },
      { Column1: 'NW/NWPW', Column2: '3', Column3: 1, Column4: '3' },
      { Column1: 'NW/SAB', Column2: '4', Column3: 4, Column4: '4' },
      { Column1: 'NW/SPE', Column2: '10', Column3: 10, Column4: '10' },
      { Column1: 'NW/SPW', Column2: '6', Column3: 5, Column4: '6' },
      { Column1: 'NW/UVA', Column2: '7', Column3: 8, Column4: '7' },
      { Column1: 'NW/WPC-1', Column2: '3', Column3: 2, Column4: '3' },
      { Column1: 'NW/WPC-2', Column2: '1', Column3: 0, Column4: '1' },
      { Column1: 'NW/WPE', Column2: '2', Column3: 3, Column4: '2' },
      { Column1: 'NW/WPN', Column2: '4', Column3: 0, Column4: '4' },
      { Column1: 'NW/WPNE', Column2: '4', Column3: 0, Column4: '4' },
      { Column1: 'NW/WPS', Column2: '2', Column3: 2, Column4: '2' },
      { Column1: 'NW/WPSE', Column2: '2', Column3: 0, Column4: '2' },
      { Column1: 'NW/WPSW', Column2: '1', Column3: 0, Column4: '1' }
    ]
  },
  {
    month: 'August',
    details: [
      { Column1: 'NW/CPN', Column2: '8', Column3: 0, Column4: '16' },
      { Column1: 'NW/CPS', Column2: '9', Column3: 1, Column4: '19' },
      { Column1: 'NW/EP', Column2: '5', Column3: 0, Column4: '10' },
      { Column1: 'NW/NCP', Column2: '9', Column3: 0, Column4: '18' },
      { Column1: 'NW/NP-1', Column2: '3', Column3: 0, Column4: '7' },
      { Column1: 'NW/NP-2', Column2: '9', Column3: 0, Column4: '19' },
      { Column1: 'NW/NWPE', Column2: '4', Column3: 0, Column4: '8' },
      { Column1: 'NW/NWPW', Column2: '3', Column3: 0, Column4: '6' },
      { Column1: 'NW/SAB', Column2: '4', Column3: 0, Column4: '8' },
      { Column1: 'NW/SPE', Column2: '10', Column3: 0, Column4: '20' },
      { Column1: 'NW/SPW', Column2: '5', Column3: 0, Column4: '11' },
      { Column1: 'NW/UVA', Column2: '6', Column3: 0, Column4: '13' },
      { Column1: 'NW/WPC-1', Column2: '3', Column3: 0, Column4: '6' },
      { Column1: 'NW/WPC-2', Column2: '1', Column3: 0, Column4: '2' },
      { Column1: 'NW/WPE', Column2: '1', Column3: 0, Column4: '3' },
      { Column1: 'NW/WPN', Column2: '3', Column3: 1, Column4: '7' },
      { Column1: 'NW/WPNE', Column2: '4', Column3: 0, Column4: '8' },
      { Column1: 'NW/WPS', Column2: '2', Column3: 0, Column4: '4' },
      { Column1: 'NW/WPSE', Column2: '2', Column3: 0, Column4: '4' },
      { Column1: 'NW/WPSW', Column2: '1', Column3: 0, Column4: '2' }
    ]
  },
  {
    month: 'September',
    details: [
      { Column1: 'NW/CPN', Column2: '8', Column3: 0, Column4: '24' },
      { Column1: 'NW/CPS', Column2: '9', Column3: 0, Column4: '28' },
      { Column1: 'NW/EP', Column2: '5', Column3: 0, Column4: '15' },
      { Column1: 'NW/NCP', Column2: '9', Column3: 0, Column4: '27' },
      { Column1: 'NW/NP-1', Column2: '3', Column3: 0, Column4: '10' },
      { Column1: 'NW/NP-2', Column2: '9', Column3: 0, Column4: '28' },
      { Column1: 'NW/NWPE', Column2: '3', Column3: 0, Column4: '11' },
      { Column1: 'NW/NWPW', Column2: '3', Column3: 0, Column4: '9' },
      { Column1: 'NW/SAB', Column2: '3', Column3: 0, Column4: '11' },
      { Column1: 'NW/SPE', Column2: '9', Column3: 0, Column4: '29' },
      { Column1: 'NW/SPW', Column2: '5', Column3: 0, Column4: '16' },
      { Column1: 'NW/UVA', Column2: '6', Column3: 0, Column4: '19' },
      { Column1: 'NW/WPC-1', Column2: '2', Column3: 0, Column4: '8' },
      { Column1: 'NW/WPC-2', Column2: '1', Column3: 0, Column4: '3' },
      { Column1: 'NW/WPE', Column2: '1', Column3: 0, Column4: '4' },
      { Column1: 'NW/WPN', Column2: '3', Column3: 0, Column4: '10' },
      { Column1: 'NW/WPNE', Column2: '3', Column3: 0, Column4: '11' },
      { Column1: 'NW/WPS', Column2: '1', Column3: 0, Column4: '5' },
      { Column1: 'NW/WPSE', Column2: '2', Column3: 0, Column4: '6' },
      { Column1: 'NW/WPSW', Column2: '1', Column3: 0, Column4: '3' }
    ]
  },
  {
    month: 'October',
    details: [
      { Column1: 'NW/CPN', Column2: '8', Column3: 0, Column4: '8' },
      { Column1: 'NW/CPS', Column2: '10', Column3: 0, Column4: '10' },
      { Column1: 'NW/EP', Column2: '5', Column3: 0, Column4: '5' },
      { Column1: 'NW/NCP', Column2: '9', Column3: 0, Column4: '9' },
      { Column1: 'NW/NP-1', Column2: '4', Column3: 0, Column4: '4' },
      { Column1: 'NW/NP-2', Column2: '10', Column3: 0, Column4: '10' },
      { Column1: 'NW/NWPE', Column2: '4', Column3: 0, Column4: '4' },
      { Column1: 'NW/NWPW', Column2: '3', Column3: 0, Column4: '3' },
      { Column1: 'NW/SAB', Column2: '4', Column3: 0, Column4: '4' },
      { Column1: 'NW/SPE', Column2: '10', Column3: 0, Column4: '10' },
      { Column1: 'NW/SPW', Column2: '6', Column3: 0, Column4: '6' },
      { Column1: 'NW/UVA', Column2: '7', Column3: 0, Column4: '7' },
      { Column1: 'NW/WPC-1', Column2: '3', Column3: 0, Column4: '3' },
      { Column1: 'NW/WPC-2', Column2: '1', Column3: 0, Column4: '1' },
      { Column1: 'NW/WPE', Column2: '2', Column3: 0, Column4: '2' },
      { Column1: 'NW/WPN', Column2: '4', Column3: 0, Column4: '4' },
      { Column1: 'NW/WPNE', Column2: '4', Column3: 0, Column4: '4' },
      { Column1: 'NW/WPS', Column2: '2', Column3: 0, Column4: '2' },
      { Column1: 'NW/WPSE', Column2: '2', Column3: 0, Column4: '2' },
      { Column1: 'NW/WPSW', Column2: '1', Column3: 0, Column4: '1' }
    ]
  },
  {
    month: 'November',
    details: [
      { Column1: 'NW/CPN', Column2: '8', Column3: 0, Column4: '16' },
      { Column1: 'NW/CPS', Column2: '9', Column3: 0, Column4: '19' },
      { Column1: 'NW/EP', Column2: '5', Column3: 0, Column4: '10' },
      { Column1: 'NW/NCP', Column2: '9', Column3: 0, Column4: '18' },
      { Column1: 'NW/NP-1', Column2: '3', Column3: 0, Column4: '7' },
      { Column1: 'NW/NP-2', Column2: '9', Column3: 0, Column4: '19' },
      { Column1: 'NW/NWPE', Column2: '4', Column3: 0, Column4: '8' },
      { Column1: 'NW/NWPW', Column2: '3', Column3: 0, Column4: '6' },
      { Column1: 'NW/SAB', Column2: '4', Column3: 0, Column4: '8' },
      { Column1: 'NW/SPE', Column2: '10', Column3: 0, Column4: '20' },
      { Column1: 'NW/SPW', Column2: '5', Column3: 0, Column4: '11' },
      { Column1: 'NW/UVA', Column2: '6', Column3: 1, Column4: '13' },
      { Column1: 'NW/WPC-1', Column2: '3', Column3: 0, Column4: '6' },
      { Column1: 'NW/WPC-2', Column2: '1', Column3: 0, Column4: '2' },
      { Column1: 'NW/WPE', Column2: '1', Column3: 0, Column4: '3' },
      { Column1: 'NW/WPN', Column2: '3', Column3: 0, Column4: '7' },
      { Column1: 'NW/WPNE', Column2: '4', Column3: 0, Column4: '8' },
      { Column1: 'NW/WPS', Column2: '2', Column3: 0, Column4: '4' },
      { Column1: 'NW/WPSE', Column2: '2', Column3: 0, Column4: '4' },
      { Column1: 'NW/WPSW', Column2: '1', Column3: 0, Column4: '2' }
    ]
  },
  {
    month: 'December',
    details: [
      { Column1: 'NW/CPN', Column2: '8', Column3: 0, Column4: '24' },
      { Column1: 'NW/CPS', Column2: '9', Column3: 0, Column4: '28' },
      { Column1: 'NW/EP', Column2: '5', Column3: 0, Column4: '15' },
      { Column1: 'NW/NCP', Column2: '9', Column3: 0, Column4: '27' },
      { Column1: 'NW/NP-1', Column2: '3', Column3: 0, Column4: '10' },
      { Column1: 'NW/NP-2', Column2: '9', Column3: 0, Column4: '28' },
      { Column1: 'NW/NWPE', Column2: '3', Column3: 0, Column4: '11' },
      { Column1: 'NW/NWPW', Column2: '3', Column3: 0, Column4: '9' },
      { Column1: 'NW/SAB', Column2: '3', Column3: 0, Column4: '11' },
      { Column1: 'NW/SPE', Column2: '9', Column3: 0, Column4: '29' },
      { Column1: 'NW/SPW', Column2: '5', Column3: 0, Column4: '16' },
      { Column1: 'NW/UVA', Column2: '6', Column3: 0, Column4: '19' },
      { Column1: 'NW/WPC-1', Column2: '2', Column3: 0, Column4: '8' },
      { Column1: 'NW/WPC-2', Column2: '1', Column3: 0, Column4: '3' },
      { Column1: 'NW/WPE', Column2: '1', Column3: 0, Column4: '4' },
      { Column1: 'NW/WPN', Column2: '3', Column3: 0, Column4: '10' },
      { Column1: 'NW/WPNE', Column2: '3', Column3: 0, Column4: '11' },
      { Column1: 'NW/WPS', Column2: '1', Column3: 0, Column4: '5' },
      { Column1: 'NW/WPSE', Column2: '2', Column3: 0, Column4: '6' },
      { Column1: 'NW/WPSW', Column2: '1', Column3: 0, Column4: '3' }
    ]
  }
];

@Component({
  selector: 'app-tower-mtce-achievement',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './tower-mtce-achievement.component.html',
  styleUrls: ['./tower-mtce-achievement.component.scss']
})
export class TowerMtceAchievementComponent implements OnInit {
  private readonly http = inject(HttpClient);

  pageTitle = 'KPI(TOWER MAINTENANCE)';
  readonly heroSubtitle = 'Quarterly tower maintenance achievement across NW regions.';
  readonly columns = TOWER_COLUMNS;
  headers: string[] = [...TOWER_COLUMNS];
  tableData: TowerRecord[] = [...TOWER_TABLE_FALLBACK];
  calculatedValues: string[] = [];
  kpiTowerData: KpiTowerRow[] = [...TOWER_KPI_FALLBACK];
  weightedRows: string[][] = [];
  loading = false;
  errorMessage = '';

  constructor() {
    this.calculatedValues = this.calculateValues(this.tableData, this.headers);
    this.weightedRows = this.buildWeightedRows(TOWER_KPI_FALLBACK, this.calculatedValues);
  }

  ngOnInit(): void {
    this.fetchData();
  }

  get totalTableColumns(): number {
    return 5 + this.headers.length;
  }

  fetchData(): void {
    this.loading = true;
    this.errorMessage = '';

    forkJoin({
      distribution: this.http.get<TowerRecord[]>('/api/ProcessedDataFetch1').pipe(
        catchError(err => {
          console.error('Failed to fetch tower distribution data', err);
          this.setError('Unable to load tower distribution feeds.');
          return of([]);
        })
      ),
      kpis: this.http.get<KpiTowerRow[]>('/api/kpi-tower').pipe(
        catchError(err => {
          console.error('Failed to fetch tower KPI definitions', err);
          this.setError('Unable to load tower KPI definitions.');
          return of([]);
        })
      )
    })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe(({ distribution, kpis }) => {
        this.tableData = distribution?.length ? distribution : [...TOWER_TABLE_FALLBACK];
        this.headers = [...TOWER_COLUMNS];
        const hasKpis = Boolean(kpis?.length);
        const sourceRows = hasKpis ? kpis ?? [] : TOWER_KPI_FALLBACK;
        this.kpiTowerData = sourceRows
          .slice()
          .sort((a, b) => (a.no ?? Infinity) - (b.no ?? Infinity));

        this.calculatedValues = this.calculateValues(this.tableData, this.headers);
        this.weightedRows = this.buildWeightedRows(this.kpiTowerData, this.calculatedValues);
      });
  }

  exportToExcel(): void {
    if (!this.kpiTowerData.length) {
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('KPI Tower Maintenance');

    const headerStyle = {
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: '1F4E79' } },
      font: { bold: true, color: { argb: 'FFFFFFFF' } },
      alignment: { horizontal: 'center', vertical: 'middle' },
      border: {
        top: { style: 'thin' as ExcelJS.BorderStyle },
        left: { style: 'thin' as ExcelJS.BorderStyle },
        bottom: { style: 'thin' as ExcelJS.BorderStyle },
        right: { style: 'thin' as ExcelJS.BorderStyle }
      }
    };

    const borderStyle: Partial<ExcelJS.Borders> = {
      top: { style: 'thin' as ExcelJS.BorderStyle },
      left: { style: 'thin' as ExcelJS.BorderStyle },
      bottom: { style: 'thin' as ExcelJS.BorderStyle },
      right: { style: 'thin' as ExcelJS.BorderStyle }
    };

    const lastColumnIndex = this.totalTableColumns;
    sheet.mergeCells(1, 1, 2, lastColumnIndex);
    const titleCell = sheet.getCell(1, 1);
    titleCell.value = 'KPI (TOWER MAINTENANCE)';
    titleCell.font = { bold: true, size: 14 };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

    const tableHeaders = [
      'No',
      'Network Engineers Responsibility',
      'Frequency',
      'Weightage',
      'KPI (%)',
      ...this.headers
    ];

    const headerRow = sheet.addRow([]);
    headerRow.commit();
    const dataHeaderRow = sheet.addRow(tableHeaders);
    dataHeaderRow.eachCell(cell => Object.assign(cell, headerStyle));

    this.kpiTowerData.forEach((row, rowIndex) => {
      const weightedCells = this.getWeightedValues(rowIndex);
      const newRow = sheet.addRow([
        row.no ?? '-',
        row.responsibility ?? '-',
        row.frequency ?? '-',
        row.weightage ?? '-',
        row.kpi ?? '-',
        ...weightedCells.map(value => (value ? `${value}%` : '-'))
      ]);
      newRow.eachCell(cell => {
        cell.border = { ...borderStyle } as ExcelJS.Borders;
      });
    });

    sheet.columns?.forEach(column => {
      column.width = 18;
    });

    workbook.xlsx.writeBuffer().then(buffer => {
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'KPI_Tower_Maintenance.xlsx';
      link.click();
      URL.revokeObjectURL(link.href);
    });
  }

  trackByHeader = (_: number, header: string) => header;
  trackByKpiRow = (_: number, row: KpiTowerRow) => row._id ?? row.no ?? _;

  formatWeightedValue(rowIndex: number, columnIndex: number): string {
    const row = this.weightedRows[rowIndex];
    const value = row?.[columnIndex];
    if (!value) {
      return '-';
    }
    return `${value}%`;
  }

  getWeightedValues(rowIndex: number): string[] {
    if (!this.headers.length) {
      return [];
    }
    return this.weightedRows[rowIndex] ?? this.headers.map(() => '');
  }

  formatText(value?: string | number): string {
    if (value === undefined || value === null || value === '') {
      return '-';
    }
    return String(value);
  }

  getCalculatedValue(index: number): string {
    return this.calculatedValues[index] ?? '0.00';
  }

  private setError(message: string): void {
    this.errorMessage = message;
  }

  private calculateValues(data: TowerRecord[], headers: string[]): string[] {
    if (!data.length || !headers.length) {
      return [];
    }

    const currentMonth = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date());
    const specialMonths = ['March', 'June', 'September', 'December'];

    if (!specialMonths.includes(currentMonth)) {
      return headers.map(() => '100.00');
    }

    const selectedMonths = this.getQuarterMonths(currentMonth);

    return headers.map(header => {
      let totalAchievement = 0;
      let totalDistribution = 0;

      data.forEach(monthData => {
        if (!selectedMonths.includes(monthData.month)) {
          return;
        }
        const columnData = monthData.details?.find(detail => detail.Column1 === header);
        if (columnData) {
          totalAchievement += this.toNumber(columnData.Column3);
          totalDistribution += this.toNumber(columnData.Column2);
        }
      });

      if (totalDistribution <= 0) {
        return '0.00';
      }

      const percentage = (totalAchievement / totalDistribution) * 100;
      return percentage.toFixed(2);
    });
  }

  private getQuarterMonths(currentMonth: string): string[] {
    switch (currentMonth) {
      case 'March':
        return ['January', 'February', 'March'];
      case 'June':
        return ['April', 'May', 'June'];
      case 'September':
        return ['July', 'August', 'September'];
      case 'December':
        return ['October', 'November', 'December'];
      default:
        return [];
    }
  }

  private buildWeightedRows(kpiRows: KpiTowerRow[], computedValues: string[]): string[][] {
    if (!kpiRows.length || !computedValues.length) {
      return [];
    }

    return kpiRows.map(row => {
      const weightage = this.toNumber(row.weightage);
      return computedValues.map(value => {
        const numericValue = this.toNumber(value);
        if (!weightage || !numericValue) {
          return '0.00';
        }
        const weighted = (numericValue * weightage) / 100;
        return weighted.toFixed(2);
      });
    });
  }

  private toNumber(value: unknown): number {
    if (value === undefined || value === null) {
      return 0;
    }
    if (typeof value === 'number') {
      return value;
    }
    const parsed = parseFloat(String(value).replace(/[^\d.-]/g, ''));
    return Number.isFinite(parsed) ? parsed : 0;
  }
}

