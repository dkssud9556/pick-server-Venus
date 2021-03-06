import {
  ClubRepository,
  GetClubsResponse,
  UpdateClubRequest,
} from "../../interfaces";
import { Club } from "../../models";
import FakeClubLocationRepository from "./FakeClubLocationRepository";

export default class FakeClubRepository implements ClubRepository {
  private static _default: FakeClubRepository;
  private clubs: Club[] = [];
  private clubLocationRepository: FakeClubLocationRepository;

  public static get default(): FakeClubRepository {
    if (!FakeClubRepository._default) {
      FakeClubRepository._default = new FakeClubRepository();
    }
    return FakeClubRepository._default;
  }

  public setClubLocationRepository(
    clubLocationRepository: FakeClubLocationRepository
  ) {
    this.clubLocationRepository = clubLocationRepository;
  }

  public findAll(): Promise<GetClubsResponse[]> {
    return new Promise<GetClubsResponse[]>((resolve, reject) => {
      const clubLocations = this.clubLocationRepository.getLocations();
      const response: GetClubsResponse[] = this.clubs.map((club) => {
        for (let clubLocation of clubLocations) {
          if (clubLocation.location === club.location) {
            return {
              ...club,
              ...clubLocation,
            };
          }
        }
      });
      response.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
      resolve(response);
    });
  }

  public addClub(club: Club): Promise<Club> {
    return new Promise<Club>((resolve) => {
      this.clubs.push(club);
      resolve(club);
    });
  }

  public clear(): void {
    this.clubs = [];
  }

  public findClubByLocation(location: string): Promise<Club> {
    return new Promise<Club>((resolve) => {
      resolve(this.clubs.find((club) => club.location === location));
    });
  }

  public findClubByName(name: string): Promise<Club> {
    return new Promise<Club>((resolve) => {
      resolve(this.clubs.find((club) => club.name === name));
    });
  }

  public findClubByNameWithLocation(name: string): Promise<GetClubsResponse> {
    return new Promise<GetClubsResponse>((resolve) => {
      const locations = this.clubLocationRepository.getLocations();
      const club = this.clubs.find((c) => c.name === name);
      for (let location of locations) {
        if (location.location === club.location) {
          resolve({ ...club, ...location });
        }
      }
    });
  }

  public deleteClubByName(name: string): Promise<void> {
    return new Promise<void>((resolve) => {
      this.clubs = this.clubs.filter((club) => club.name !== name);
      resolve();
    });
  }

  public updateClub(clubName: string, club: UpdateClubRequest): Promise<void> {
    return new Promise<void>((resolve) => {
      const idx = this.clubs.findIndex((club) => club.name === clubName);
      this.clubs[idx] = { ...this.clubs[idx], ...club };
      resolve();
    });
  }

  public isAssignedLocation(location: string): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      resolve(
        Boolean(
          this.clubs.findIndex((club) => club.location === location) !== -1
        )
      );
    });
  }
}
