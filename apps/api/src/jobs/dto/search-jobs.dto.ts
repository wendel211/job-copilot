import { IsOptional, IsString, IsNumberString, IsBooleanString } from "class-validator";

export class SearchJobsDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsBooleanString()
  remote?: string; 

  @IsOptional()
  @IsString()
  company?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  atsType?: string;

  @IsOptional()
  @IsNumberString()
  take?: string;

  @IsOptional()
  @IsNumberString()
  skip?: string;
}
