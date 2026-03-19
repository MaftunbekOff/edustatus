import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateCustomDomainDto {
  @IsString()
  @IsNotEmpty()
  domain: string; // talaba.namangan-texnikum.uz

  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean;
}

export class VerifyCustomDomainDto {
  // No additional fields needed - verification token is already generated
}

export class SetPrimaryDomainDto {
  @IsBoolean()
  isPrimary: boolean;
}
