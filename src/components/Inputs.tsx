/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import Role from './Role';
import Select from './Select';
import Input from './Input';
import Outputs from './Outputs';
import selectData from '../data/selectData.json';
import removeSecret from '../lib/removeSecret';
import jwtSignature from '../lib/jwtSignature';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import FormStyles from './styles/FormStyles';
import ButtonStyles from './styles/ButtonStyles';

interface InputData {
  name: string;
  company: string;
  secret: string;
  exp: number;
  aud?: string;
}

const Inputs: React.FC = () => {
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedSubRole, setSelectedSubRole] = useState<string>('');
  const [selectedExpiryDate, setSelectedExpiryDate] = useState<string>('1y');
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [secretShown, setSecretShown] = useState<boolean>(false);
  const [generatedToken, setGeneratedToken] = useState<string>('');
  const [inputData, setInputData] = useState<InputData>({
    name: '',
    company: '',
    secret: `${window.location.hash.replace('#', '')}`,
    exp: 0,
  });

  useEffect(() => {
    removeSecret();
  }, []);

  const clearRoleInputs = () => {
    setSelectedTable('');
    setSelectedRole('');
    setSelectedSubRole('');
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const data = { roles: selectedRoles, ...inputData, selectedExpiryDate };
    jwtSignature(data, setGeneratedToken, selectedExpiryDate);
  };

  const handleAddClick = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();

    const selectedNewRole = `${selectedTable}${selectedRole ? `_${selectedRole}` : ''}${
      selectedSubRole ? `_${selectedSubRole}` : ''
    }`;
    if (selectedNewRole !== '' && !selectedRoles.find(r => r === selectedNewRole)) {
      const newRoles = [selectedNewRole, ...selectedRoles];
      setSelectedRoles(newRoles);
    }

    clearRoleInputs();
  };

  const toggleSecretVisibility = () => {
    setSecretShown(secretShown ? false : true);
  };

  const changeHandler = ({ target }: React.ChangeEvent<HTMLInputElement>) => {
    const value = target.value;
    const name = target.name;

    if (!value && name === 'aud') {
      let copyOfInput = { ...inputData };
      delete copyOfInput.aud;
      setInputData(copyOfInput);
    } else {
      setInputData({
        ...inputData,
        [name]: value,
      });
    }
  };

  return (
    <>
      <FormStyles onSubmit={handleSubmit}>
        <Input
          title='Name'
          id='name-input'
          placeholder='name'
          name='name'
          onChange={changeHandler}
          value={inputData.name}
          required={true}
          autoComplete='off'
          autoFocus={true}
        />
        <Input
          title='Company'
          id='company-input'
          placeholder='company name'
          name='company'
          onChange={changeHandler}
          value={inputData.company}
          required={true}
          autoComplete='off'
        />
        <label htmlFor='role-input'>Roles</label>
        <div className='role-input' id='role-input'>
          <Select
            name='role'
            roles={selectedRoles}
            selectedElement={selectedTable}
            setSelectedElement={setSelectedTable}
            elements={selectData.tables}
          />
          <Select
            name='role'
            roles={selectedRoles}
            selectedElement={selectedRole}
            setSelectedElement={setSelectedRole}
            elements={selectData.roles}
          />

          {selectData.subroles.find(s => s.role === selectedRole) && (
            <Select
              name='role'
              selectedElement={selectedSubRole}
              setSelectedElement={setSelectedSubRole}
              elements={selectData.subroles.filter(s => s.role === selectedRole)[0].roles}
            />
          )}
          <ButtonStyles className='add-button' onClick={handleAddClick}>
            +
          </ButtonStyles>
        </div>

        <div className='roles'>
          {selectedRoles.map((r, index) => (
            <Role
              key={index}
              text={r}
              onClick={() => {
                setSelectedRoles(selectedRoles.filter(item => item !== r));
              }}
            />
          ))}
        </div>

        <label htmlFor='expiry-select'>Expiry Date </label>

        <div className='select'>
          <select
            name='exp-select'
            value={selectedExpiryDate}
            onChange={e => {
              setSelectedExpiryDate(e.target.value);
            }}>
            <option value='1y'>1 year</option>
            <option value='30d'>30 days</option>
          </select>
        </div>

        <Input
          title='Audience'
          id='aud-input'
          placeholder='aud'
          name='aud'
          onChange={changeHandler}
          value={inputData.aud ?? ''}
          autoComplete='off'
        />

        <div className='secret-wrapper'>
          <Input
            title='Secret'
            id='secret-input'
            placeholder='secret'
            type={secretShown ? 'text' : 'password'}
            name='secret'
            onChange={changeHandler}
            value={inputData.secret}
            required={true}
            autoComplete='off'
          />
          <FontAwesomeIcon
            className='icon'
            icon={secretShown === false ? faEye : faEyeSlash}
            onClick={toggleSecretVisibility}
          />
        </div>

        <ButtonStyles type='submit' className='submit-button'>
          Create signature
        </ButtonStyles>
      </FormStyles>

      <Outputs roles={selectedRoles} data={inputData} generatedToken={generatedToken} />
    </>
  );
};

export default Inputs;
