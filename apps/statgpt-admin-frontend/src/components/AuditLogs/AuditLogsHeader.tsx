'use client';

// import { Button } from '../BaseComponents/Button/Button';
// import { TimePeriodDropdown } from './TimePeriodDropdown';

export const AuditLogsHeader = () => {
  return (
    <div className="flex flex-row items-center justify-between">
      <h1>Audit</h1>

      {/* <div className="flex flex-row gap-4 items-center">
        <TimePeriodDropdown
          onChange={(value) => console.log(value)}
          defaultPresetId="last_2d"
        />
        <div className="h-6 border-l border-l-primary" />
        <Button
          cssClass="secondary"
          title="Refresh"
          onClick={() => console.log('refresh')}
        />
        <Button
          cssClass="primary"
          title="Export"
          onClick={() => console.log('export')}
        />
      </div> */}
    </div>
  );
};
