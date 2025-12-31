export interface ScrapedJob {
  title: string;
  description: string;
  location?: string | null;
  remote?: boolean;
  applyUrl: string;
  company: {
    name: string;
    website?: string;
  };
  postedAt?: Date | null;
}

export interface JobScraper {
  canHandle(url: string): boolean;
  scrape(url: string, html: string): Promise<ScrapedJob>;
}

export interface ScraperInterface {

  scrape(url: string, html?: string): Promise<any>; 
  
  listJobs?(sourceIdentifier: string): Promise<any[]>;
}