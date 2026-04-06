import { AppContext } from "../../config";
import { User, UserData } from "../../domain";
import { RepositoryEvents } from "../../domain/repository";

export const onUserCreated = async (
  _input: RepositoryEvents<UserData, User>["entityCreated"],
  _ctx: AppContext
) => {
  const promises: Promise<unknown>[] = [];

  // await updateVector(entity, ctx, true);

  return Promise.all(promises);
};

export const onUserUpdated = async (
  _input: RepositoryEvents<UserData, User>["entityUpdated"],
  _ctx: AppContext
) => {
  const promises: Promise<unknown>[] = [];
  // const { data } = input;

  // if (data.description) {
  //   // await updateVector(entity, ctx, false);
  // }

  return Promise.all(promises);
};

export const onUserDeleted = async (
  _input: RepositoryEvents<UserData, User>["entityDeleted"],
  _ctx: AppContext
) => {
  const promises: Promise<unknown>[] = [];

  // await ctx.repo.docContent.deleteVector(entity.id, { ctx }).catch((err) => {
  //   console.error(
  //     "Error deleting vector for User on deletion",
  //     entity.id,
  //     err
  //   );
  // });

  return Promise.all(promises);
};
